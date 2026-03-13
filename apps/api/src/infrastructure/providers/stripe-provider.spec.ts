import { beforeEach, describe, expect, it, vi } from "vitest";

import { StripeProviderImpl } from "./stripe-provider.js";

const mockCheckoutCreate = vi.hoisted(() => vi.fn());
const mockPortalCreate = vi.hoisted(() => vi.fn());
const mockConstructEvent = vi.hoisted(() => vi.fn());
const mockSubscriptionsRetrieve = vi.hoisted(() => vi.fn());

const MockStripe = vi.hoisted(() =>
  vi.fn().mockImplementation(function (this: unknown) {
    return {
      checkout: { sessions: { create: mockCheckoutCreate } },
      billingPortal: { sessions: { create: mockPortalCreate } },
      webhooks: { constructEvent: mockConstructEvent },
      subscriptions: { retrieve: mockSubscriptionsRetrieve },
    };
  }),
);

vi.mock("stripe", () => ({ default: MockStripe }));

const mockEnv = vi.hoisted(() => ({
  STRIPE_SECRET_KEY: "sk_test_fake",
}));
vi.mock("../../lib/env.js", () => ({ env: mockEnv }));

describe("StripeProviderImpl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.STRIPE_SECRET_KEY = "sk_test_fake";
  });

  describe("createCheckoutSession", () => {
    it("should throw when STRIPE_SECRET_KEY is not set", async () => {
      mockEnv.STRIPE_SECRET_KEY = undefined as unknown as string;
      const provider = new StripeProviderImpl();
      await expect(
        provider.createCheckoutSession({
          priceId: "price_1",
          userId: "user-1",
          successUrl: "https://app/success",
          cancelUrl: "https://app/cancel",
        }),
      ).rejects.toThrow("STRIPE_SECRET_KEY is not configured");
    });

    it("should return url and sessionId when Stripe succeeds", async () => {
      mockCheckoutCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/c/pay/cs_123",
      });
      const provider = new StripeProviderImpl();
      const result = await provider.createCheckoutSession({
        priceId: "price_1",
        userId: "user-1",
        customerEmail: "u@test.dev",
        successUrl: "https://app/success",
        cancelUrl: "https://app/cancel",
      });
      expect(result).toEqual({
        url: "https://checkout.stripe.com/c/pay/cs_123",
        sessionId: "cs_123",
      });
      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "subscription",
          line_items: [{ price: "price_1", quantity: 1 }],
          client_reference_id: "user-1",
          customer_email: "u@test.dev",
        }),
      );
    });
  });

  describe("createBillingPortalSession", () => {
    it("should throw when STRIPE_SECRET_KEY is not set", async () => {
      mockEnv.STRIPE_SECRET_KEY = undefined as unknown as string;
      const provider = new StripeProviderImpl();
      await expect(
        provider.createBillingPortalSession({
          customerId: "cus_1",
          returnUrl: "https://app/billing",
        }),
      ).rejects.toThrow("STRIPE_SECRET_KEY is not configured");
    });

    it("should return url when Stripe succeeds", async () => {
      mockPortalCreate.mockResolvedValue({
        url: "https://billing.stripe.com/session",
      });
      const provider = new StripeProviderImpl();
      const result = await provider.createBillingPortalSession({
        customerId: "cus_123",
        returnUrl: "https://app/billing",
      });
      expect(result).toEqual({ url: "https://billing.stripe.com/session" });
      expect(mockPortalCreate).toHaveBeenCalledWith({
        customer: "cus_123",
        return_url: "https://app/billing",
      });
    });
  });

  describe("constructWebhookEvent", () => {
    it("should throw when STRIPE_SECRET_KEY is not set", () => {
      mockEnv.STRIPE_SECRET_KEY = undefined as unknown as string;
      const provider = new StripeProviderImpl();
      expect(() =>
        provider.constructWebhookEvent("{}", "sig", "whsec_x"),
      ).toThrow("STRIPE_SECRET_KEY is not configured");
    });

    it("should return event type and data when Stripe succeeds", () => {
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: { id: "cs_1", subscription: "sub_1" } },
      });
      const provider = new StripeProviderImpl();
      const result = provider.constructWebhookEvent(
        Buffer.from("{}"),
        "v1,sig",
        "whsec_secret",
      );
      expect(result.type).toBe("checkout.session.completed");
      expect(result.data.object).toEqual({ id: "cs_1", subscription: "sub_1" });
      expect(mockConstructEvent).toHaveBeenCalledWith(
        Buffer.from("{}"),
        "v1,sig",
        "whsec_secret",
      );
    });
  });

  describe("getSubscriptionDetails", () => {
    it("should return null when STRIPE_SECRET_KEY is not set", async () => {
      mockEnv.STRIPE_SECRET_KEY = undefined as unknown as string;
      const provider = new StripeProviderImpl();
      const result = await provider.getSubscriptionDetails("sub_1");
      expect(result).toBeNull();
    });

    it("should return subscription details when Stripe succeeds", async () => {
      mockSubscriptionsRetrieve.mockResolvedValue({
        id: "sub_1",
        status: "active",
        current_period_start: 1000000000,
        current_period_end: 1000000000 + 30 * 24 * 3600,
        cancel_at_period_end: false,
        trial_end: null,
        items: {
          data: [{ price: { id: "price_1" } }],
        },
      });
      const provider = new StripeProviderImpl();
      const result = await provider.getSubscriptionDetails("sub_1");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("sub_1");
      expect(result?.stripePriceId).toBe("price_1");
      expect(result?.status).toBe("active");
      expect(result?.cancelAtPeriodEnd).toBe(false);
      expect(result?.trialEnd).toBeNull();
    });
  });
});
