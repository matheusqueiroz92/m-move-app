import type {
  CreateSubscriptionInput,
  SubscriptionRepository,
  SubscriptionResult,
  UpdateSubscriptionInput,
} from "../../../../domain/subscription/repositories/subscription.repository.js";
import type { Prisma } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../../lib/db.js";
import { toSubscriptionResult } from "../mappers/subscription.mapper.js";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async create(
    input: CreateSubscriptionInput,
    tx?: Prisma.TransactionClient,
  ): Promise<SubscriptionResult> {
    const client = (tx ?? prisma) as typeof prisma;
    const sub = await client.subscription.create({
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
    tx?: Prisma.TransactionClient,
  ): Promise<SubscriptionResult | null> {
    const client = (tx ?? prisma) as typeof prisma;
    const existing = await client.subscription.findUnique({
      where: { id },
    });
    if (!existing) return null;
    const sub = await client.subscription.update({
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
