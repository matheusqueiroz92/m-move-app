import { describe, expect, it, vi } from "vitest";

import type {
  SubscriptionRepository,
  SubscriptionResult,
} from "../../domain/subscription/repositories/subscription.repository.js";
import { GetSubscriptionStatusUseCase } from "./get-subscription-status.use-case.js";

describe("GetSubscriptionStatusUseCase", () => {
  it("should return subscription when user has one", async () => {
    const sub: SubscriptionResult = {
      id: "sub-1",
      userId: "user-1",
      stripeSubscriptionId: "sub_stripe_1",
      stripePriceId: "price_1",
      planType: "STUDENT",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      trialEnd: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repository: SubscriptionRepository = {
      create: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue(sub),
      findByStripeSubscriptionId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new GetSubscriptionStatusUseCase(repository);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toEqual(sub);
    expect(repository.findByUserId).toHaveBeenCalledWith("user-1");
  });

  it("should return null when user has no subscription", async () => {
    const repository: SubscriptionRepository = {
      create: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue(null),
      findByStripeSubscriptionId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new GetSubscriptionStatusUseCase(repository);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toBeNull();
  });
});
