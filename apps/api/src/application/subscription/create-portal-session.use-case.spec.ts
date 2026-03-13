import { describe, expect, it, vi } from "vitest";

import type { StripeProvider } from "../../domain/subscription/providers/stripe-provider.interface.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";
import { CreatePortalSessionUseCase } from "./create-portal-session.use-case.js";

describe("CreatePortalSessionUseCase", () => {
  it("should return portal url when user has stripeCustomerId", async () => {
    const userRepository: UserRepository = {
      findById: vi.fn(),
      getStripeCustomerId: vi.fn().mockResolvedValue("cus_123"),
      updateSubscriptionFields: vi.fn(),
    };
    const stripeProvider: StripeProvider = {
      createCheckoutSession: vi.fn(),
      createBillingPortalSession: vi.fn().mockResolvedValue({
        url: "https://billing.stripe.com/session-456",
      }),
      constructWebhookEvent: vi.fn(),
    };

    const useCase = new CreatePortalSessionUseCase(
      userRepository,
      stripeProvider,
    );
    const result = await useCase.execute({
      userId: "user-1",
      returnUrl: "https://app.test/billing",
    });

    expect(result.url).toBe("https://billing.stripe.com/session-456");
    expect(userRepository.getStripeCustomerId).toHaveBeenCalledWith("user-1");
    expect(stripeProvider.createBillingPortalSession).toHaveBeenCalledWith({
      customerId: "cus_123",
      returnUrl: "https://app.test/billing",
    });
  });

  it("should throw when user has no stripe customer id", async () => {
    const userRepository: UserRepository = {
      findById: vi.fn(),
      getStripeCustomerId: vi.fn().mockResolvedValue(null),
      updateSubscriptionFields: vi.fn(),
    };
    const stripeProvider: StripeProvider = {
      createCheckoutSession: vi.fn(),
      createBillingPortalSession: vi.fn(),
      constructWebhookEvent: vi.fn(),
    };

    const useCase = new CreatePortalSessionUseCase(
      userRepository,
      stripeProvider,
    );

    await expect(
      useCase.execute({ userId: "user-1", returnUrl: "https://app.test" }),
    ).rejects.toThrow("User has no Stripe customer");
  });
});
