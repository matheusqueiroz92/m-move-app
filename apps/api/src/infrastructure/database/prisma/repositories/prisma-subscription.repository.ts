import type {
  CreateSubscriptionInput,
  SubscriptionRepository,
  SubscriptionResult,
  UpdateSubscriptionInput,
} from "../../../../domain/subscription/repositories/subscription.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toSubscriptionResult } from "../mappers/subscription.mapper.js";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async create(
    input: CreateSubscriptionInput,
  ): Promise<SubscriptionResult> {
    const sub = await prisma.subscription.create({
      data: {
        userId: input.userId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripePriceId: input.stripePriceId,
        planType: input.planType,
        status: input.status,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        trialEnd: input.trialEnd ?? undefined,
      },
    });
    return toSubscriptionResult(sub);
  }

  async findByUserId(userId: string): Promise<SubscriptionResult | null> {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });
    return sub ? toSubscriptionResult(sub) : null;
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionResult | null> {
    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });
    return sub ? toSubscriptionResult(sub) : null;
  }

  async update(
    id: string,
    input: UpdateSubscriptionInput,
  ): Promise<SubscriptionResult | null> {
    const existing = await prisma.subscription.findUnique({
      where: { id },
    });
    if (!existing) return null;
    const sub = await prisma.subscription.update({
      where: { id },
      data: {
        ...(input.stripePriceId !== undefined && {
          stripePriceId: input.stripePriceId,
        }),
        ...(input.planType !== undefined && { planType: input.planType }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.currentPeriodStart !== undefined && {
          currentPeriodStart: input.currentPeriodStart,
        }),
        ...(input.currentPeriodEnd !== undefined && {
          currentPeriodEnd: input.currentPeriodEnd,
        }),
        ...(input.cancelAtPeriodEnd !== undefined && {
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        }),
        ...(input.trialEnd !== undefined && { trialEnd: input.trialEnd }),
      },
    });
    return toSubscriptionResult(sub);
  }
}
