import Stripe from "stripe";

import type {
  CreateCheckoutSessionParams,
  CreateCheckoutSessionResult,
  CreatePortalSessionParams,
  CreatePortalSessionResult,
  StripeProvider,
  StripeSubscriptionDetails,
} from "../../domain/subscription/providers/stripe-provider.interface.js";
import { env } from "../../lib/env.js";

function getStripe(): Stripe | null {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export class StripeProviderImpl implements StripeProvider {
  async createCheckoutSession(
    params: CreateCheckoutSessionParams,
  ): Promise<CreateCheckoutSessionResult> {
    const stripe = getStripe();
    if (!stripe) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.userId,
      ...(params.customerId
        ? { customer: params.customerId }
        : { customer_email: params.customerEmail }),
      subscription_data: {
        metadata: { userId: params.userId },
      },
    });
    const url = session.url ?? "";
    const sessionId = session.id ?? "";
    return { url, sessionId };
  }

  async createBillingPortalSession(
    params: CreatePortalSessionParams,
  ): Promise<CreatePortalSessionResult> {
    const stripe = getStripe();
    if (!stripe) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return { url: session.url ?? "" };
  }

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): { type: string; data: { object: Record<string, unknown> } } {
    const stripe = getStripe();
    if (!stripe) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      secret,
    ) as Stripe.Event;
    return {
      type: event.type,
      data: {
        object: event.data.object as unknown as Record<string, unknown>,
      },
    };
  }

  async getSubscriptionDetails(
    subscriptionId: string,
  ): Promise<StripeSubscriptionDetails | null> {
    const stripe = getStripe();
    if (!stripe) return null;
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const item = sub.items.data[0];
    const priceId = item?.price?.id ?? "";
    type SubWithPeriod = {
      current_period_start: number;
      current_period_end: number;
      trial_end: number | null;
      cancel_at_period_end?: boolean;
    };
    const subPeriod = sub as unknown as SubWithPeriod;
    return {
      id: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      currentPeriodStart: new Date(subPeriod.current_period_start * 1000),
      currentPeriodEnd: new Date(subPeriod.current_period_end * 1000),
      cancelAtPeriodEnd: subPeriod.cancel_at_period_end ?? false,
      trialEnd: subPeriod.trial_end
        ? new Date(subPeriod.trial_end * 1000)
        : null,
    };
  }
}
