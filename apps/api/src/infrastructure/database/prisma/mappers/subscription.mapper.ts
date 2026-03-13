import type { SubscriptionResult } from "../../../../domain/subscription/repositories/subscription.repository.js";
import type { Subscription } from "../../../../generated/prisma/client.js";

export function toSubscriptionResult(
  sub: Subscription,
): SubscriptionResult {
  return {
    id: sub.id,
    userId: sub.userId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    stripePriceId: sub.stripePriceId,
    planType: sub.planType,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    trialEnd: sub.trialEnd ?? null,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
}
