import type { TransactionRunner } from "../../domain/database/transaction-client.js";
import type { UserProfileCache } from "../../domain/user/cache/user-profile-cache.interface.js";
import type { StripeProvider } from "../../domain/subscription/providers/stripe-provider.interface.js";
import type {
  PlanType,
  SubscriptionRepository,
  SubscriptionStatus,
} from "../../domain/subscription/repositories/subscription.repository.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";

const STRIPE_STATUS_TO_OUR: Record<string, SubscriptionStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  unpaid: "UNPAID",
};

/** Map Stripe price IDs to plan type (override via env/config in production). */
const PRICE_TO_PLAN: Record<string, PlanType> = {
  price_student: "STUDENT",
  price_personal: "PERSONAL",
  price_gym: "GYM",
};

function mapStatus(stripeStatus: string): SubscriptionStatus {
  return STRIPE_STATUS_TO_OUR[stripeStatus] ?? "ACTIVE";
}

function mapPlanType(stripePriceId: string): PlanType {
  return PRICE_TO_PLAN[stripePriceId] ?? "STUDENT";
}

export interface HandleStripeWebhookInput {
  payload: string | Buffer;
  signature: string;
  secret: string;
}

export class HandleStripeWebhookUseCase {
  constructor(
    private readonly stripeProvider: StripeProvider,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userRepository: UserRepository,
    private readonly transactionRunner: TransactionRunner,
    private readonly userProfileCache?: UserProfileCache,
  ) {}

  async execute(input: HandleStripeWebhookInput): Promise<void> {
    const event = this.stripeProvider.constructWebhookEvent(
      input.payload,
      input.signature,
      input.secret,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          client_reference_id?: string;
          subscription?: string;
          customer?: string;
        };
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription;
        const customerId = session.customer as string | undefined;
        if (!userId || !subscriptionId) return;

        const details =
          await this.stripeProvider.getSubscriptionDetails(subscriptionId);
        if (!details) return;

        const planType = mapPlanType(details.stripePriceId);
        const status = mapStatus(details.status);

        const existing =
          await this.subscriptionRepository.findByStripeSubscriptionId(
            subscriptionId,
          );
        await this.transactionRunner.run(async (tx) => {
          if (!existing) {
            await this.subscriptionRepository.create(
              {
                userId,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: details.stripePriceId,
                planType,
                status,
                currentPeriodStart: details.currentPeriodStart,
                currentPeriodEnd: details.currentPeriodEnd,
                cancelAtPeriodEnd: details.cancelAtPeriodEnd,
                trialEnd: details.trialEnd,
              },
              tx,
            );
          }
          await this.userRepository.updateSubscriptionFields(
            userId,
            {
              ...(customerId && { stripeCustomerId: customerId }),
              stripeSubscriptionId: subscriptionId,
              planType,
              subscriptionStatus: status,
            },
            tx,
          );
        });
        this.userProfileCache?.invalidate(userId);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as { id?: string };
        const subscriptionId = sub.id;
        if (!subscriptionId) return;

        const existing =
          await this.subscriptionRepository.findByStripeSubscriptionId(
            subscriptionId,
          );
        if (!existing) return;

        const details =
          await this.stripeProvider.getSubscriptionDetails(subscriptionId);
        if (!details) return;

        const status = mapStatus(details.status);
        const planType = mapPlanType(details.stripePriceId);

        await this.transactionRunner.run(async (tx) => {
          await this.subscriptionRepository.update(
            existing.id,
            {
              stripePriceId: details.stripePriceId,
              planType,
              status,
              currentPeriodStart: details.currentPeriodStart,
              currentPeriodEnd: details.currentPeriodEnd,
              cancelAtPeriodEnd: details.cancelAtPeriodEnd,
              trialEnd: details.trialEnd,
            },
            tx,
          );
          await this.userRepository.updateSubscriptionFields(
            existing.userId,
            { planType, subscriptionStatus: status },
            tx,
          );
        });
        this.userProfileCache?.invalidate(existing.userId);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as { id?: string };
        const subscriptionId = sub.id;
        if (!subscriptionId) return;

        const existing =
          await this.subscriptionRepository.findByStripeSubscriptionId(
            subscriptionId,
          );
        if (!existing) return;

        await this.transactionRunner.run(async (tx) => {
          await this.subscriptionRepository.update(
            existing.id,
            { status: "CANCELED" },
            tx,
          );
          await this.userRepository.updateSubscriptionFields(
            existing.userId,
            {
              stripeSubscriptionId: null,
              planType: null,
              subscriptionStatus: "CANCELED",
            },
            tx,
          );
        });
        this.userProfileCache?.invalidate(existing.userId);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as { subscription?: string };
        const subscriptionId = invoice.subscription as string | undefined;
        if (!subscriptionId) return;

        const existing =
          await this.subscriptionRepository.findByStripeSubscriptionId(
            subscriptionId,
          );
        if (!existing) return;

        await this.transactionRunner.run(async (tx) => {
          await this.subscriptionRepository.update(
            existing.id,
            { status: "PAST_DUE" },
            tx,
          );
          await this.userRepository.updateSubscriptionFields(
            existing.userId,
            { subscriptionStatus: "PAST_DUE" },
            tx,
          );
        });
        this.userProfileCache?.invalidate(existing.userId);
        break;
      }
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as { id?: string };
        const subscriptionId = sub.id;
        if (!subscriptionId) return;

        const existing =
          await this.subscriptionRepository.findByStripeSubscriptionId(
            subscriptionId,
          );
        if (!existing) return;

        this.userProfileCache?.invalidate(existing.userId);
        // TODO: Enviar notificação ao usuário (email/push) 3 dias antes do trial acabar.
        // Conforme payments.mdc: "Notificar usuário 3 dias antes do trial acabar"
        break;
      }
      default:
        break;
    }
  }
}
