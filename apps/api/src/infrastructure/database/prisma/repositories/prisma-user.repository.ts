import type { Prisma } from "../../../../generated/prisma/client.js";
import type {
  UpdateUserSubscriptionInput,
  UserRepository,
  UserRepositoryFindByIdResult,
  UserRepositoryFindByIdWithPlanResult,
} from "../../../../domain/user/repositories/user.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toUserProfile } from "../mappers/user.mapper.js";

export class PrismaUserRepository implements UserRepository {
  async findById(userId: string): Promise<UserRepositoryFindByIdResult | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return user ? toUserProfile(user) : null;
  }

  async findByIdWithPlanAndTimezone(
    userId: string,
  ): Promise<UserRepositoryFindByIdWithPlanResult | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, timezone: true },
    });
    return user
      ? {
          planType: user.planType,
          timezone: user.timezone ?? null,
        }
      : null;
  }

  async getStripeCustomerId(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    return user?.stripeCustomerId ?? null;
  }

  async updateSubscriptionFields(
    userId: string,
    input: UpdateUserSubscriptionInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = (tx ?? prisma) as typeof prisma;
    await client.user.update({
      where: { id: userId },
      data: {
        ...(input.stripeCustomerId !== undefined && {
          stripeCustomerId: input.stripeCustomerId,
        }),
        ...(input.stripeSubscriptionId !== undefined && {
          stripeSubscriptionId: input.stripeSubscriptionId,
        }),
        ...(input.planType !== undefined && { planType: input.planType }),
        ...(input.subscriptionStatus !== undefined && {
          subscriptionStatus: input.subscriptionStatus,
        }),
      },
    });
  }
}
