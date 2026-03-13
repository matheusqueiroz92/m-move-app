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
        if (!existing) {
          await this.subscriptionRepository.create({
            userId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: details.stripePriceId,
            planType,
            status,
            currentPeriodStart: details.currentPeriodStart,
            currentPeriodEnd: details.currentPeriodEnd,
            cancelAtPeriodEnd: details.cancelAtPeriodEnd,
            trialEnd: details.trialEnd,
          });
        }
        await this.userRepository.updateSubscriptionFields(userId, {
          ...(customerId && { stripeCustomerId: customerId }),
          stripeSubscriptionId: subscriptionId,
          planType,
          subscriptionStatus: status,
        });
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

        await this.subscriptionRepository.update(existing.id, {
          stripePriceId: details.stripePriceId,
          planType,
          status,
          currentPeriodStart: details.currentPeriodStart,
          currentPeriodEnd: details.currentPeriodEnd,
          cancelAtPeriodEnd: details.cancelAtPeriodEnd,
          trialEnd: details.trialEnd,
        });
        await this.userRepository.updateSubscriptionFields(existing.userId, {
          planType,
          subscriptionStatus: status,
        });
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

        await this.subscriptionRepository.update(existing.id, {
          status: "CANCELED",
        });
        await this.userRepository.updateSubscriptionFields(existing.userId, {
          stripeSubscriptionId: null,
          planType: null,
          subscriptionStatus: "CANCELED",
        });
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

        await this.subscriptionRepository.update(existing.id, {
          status: "PAST_DUE",
        });
        await this.userRepository.updateSubscriptionFields(existing.userId, {
          subscriptionStatus: "PAST_DUE",
        });
        break;
      }
      default:
        break;
    }
  }
}
