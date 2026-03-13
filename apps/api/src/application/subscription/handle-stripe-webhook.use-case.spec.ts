import { describe, expect, it, vi } from "vitest";

import type { StripeProvider } from "../../domain/subscription/providers/stripe-provider.interface.js";
import type {
  SubscriptionRepository,
  SubscriptionResult,
} from "../../domain/subscription/repositories/subscription.repository.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";
import { HandleStripeWebhookUseCase } from "./handle-stripe-webhook.use-case.js";

describe("HandleStripeWebhookUseCase", () => {
  it("should create subscription and update user on checkout.session.completed", async () => {
    const subscriptionRepository: SubscriptionRepository = {
      create: vi.fn().mockResolvedValue({
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
      }),
      findByUserId: vi.fn().mockResolvedValue(null),
      findByStripeSubscriptionId: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    };
    const userRepository: UserRepository = {
      findById: vi.fn(),
      getStripeCustomerId: vi.fn(),
      updateSubscriptionFields: vi.fn(),
    };
    const stripeProvider: StripeProvider = {
      createCheckoutSession: vi.fn(),
      createBillingPortalSession: vi.fn(),
      constructWebhookEvent: vi.fn().mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_123",
            subscription: "sub_stripe_1",
            client_reference_id: "user-1",
            customer: "cus_123",
          },
        },
      }),
      getSubscriptionDetails: vi.fn().mockResolvedValue({
        id: "sub_stripe_1",
        stripePriceId: "price_student",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        trialEnd: null,
      }),
    };

    const useCase = new HandleStripeWebhookUseCase(
      stripeProvider,
      subscriptionRepository,
      userRepository,
    );

    await useCase.execute({
      payload: "{}",
      signature: "whsec_xxx",
      secret: "whsec_secret",
    });

    expect(subscriptionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        stripeSubscriptionId: "sub_stripe_1",
        stripePriceId: "price_student",
        planType: "STUDENT",
        status: "ACTIVE",
      }),
    );
    expect(userRepository.updateSubscriptionFields).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_stripe_1",
        planType: "STUDENT",
        subscriptionStatus: "ACTIVE",
      }),
    );
  });
});
