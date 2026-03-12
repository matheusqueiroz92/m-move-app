import { vi } from "vitest";

/**
 * Example: mock Stripe provider in tests to avoid real API calls.
 * Use in a test file:
 *
 *   vi.mock("../../../infrastructure/providers/stripe-provider", () => ({
 *     createCheckoutSession: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/..." }),
 *   }));
 *
 * Or import and use mockStripe / mockOpenAI when those modules export named functions.
 */
export const mockStripeCheckoutUrl = "https://checkout.stripe.com/test";

export function createMockStripe() {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({ url: mockStripeCheckoutUrl }),
  };
}

export function createMockOpenAI() {
  return {
    chat: vi.fn().mockResolvedValue({ content: "Mocked AI response" }),
  };
}
