import { describe, expect, it, vi } from "vitest";

import type { StripeProvider } from "../../domain/subscription/providers/stripe-provider.interface.js";
import { CreateCheckoutSessionUseCase } from "./create-checkout-session.use-case.js";

describe("CreateCheckoutSessionUseCase", () => {
  it("should return checkout url from Stripe provider", async () => {
    const stripeProvider: StripeProvider = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        url: "https://checkout.stripe.com/session-123",
        sessionId: "cs_123",
      }),
      createBillingPortalSession: vi.fn(),
      constructWebhookEvent: vi.fn(),
    };

    const useCase = new CreateCheckoutSessionUseCase(stripeProvider);
    const result = await useCase.execute({
      priceId: "price_abc",
      userId: "user-1",
      customerEmail: "user@test.dev",
      successUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel",
    });

    expect(result.url).toBe("https://checkout.stripe.com/session-123");
    expect(result.sessionId).toBe("cs_123");
    expect(stripeProvider.createCheckoutSession).toHaveBeenCalledWith({
      priceId: "price_abc",
      userId: "user-1",
      customerEmail: "user@test.dev",
      successUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel",
    });
  });
});
