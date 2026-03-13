import { describe, expect, it, vi } from "vitest";

import { createCheckoutHandler } from "./create-checkout.controller.js";

const mockExecute = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    url: "https://checkout.stripe.com/test",
    sessionId: "cs_test_123",
  }),
);

function createRequest(
  overrides: { userId?: string; body?: Record<string, unknown> } = {},
) {
  return {
    userId: "user-1",
    body: {
      priceId: "price_1",
      successUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel",
    },
    server: {
      useCases: {
        createCheckoutSession: { execute: mockExecute },
      },
    },
    ...overrides,
  };
}

describe("createCheckoutHandler", () => {
  it("should return 200 and checkout url when use case succeeds", async () => {
    const request = createRequest({
      userId: "user-1",
      body: {
        priceId: "price_abc",
        successUrl: "https://app.test/success",
        cancelUrl: "https://app.test/cancel",
      },
    });
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await createCheckoutHandler(
      request as unknown as Parameters<typeof createCheckoutHandler>[0],
      reply as unknown as Parameters<typeof createCheckoutHandler>[1],
    );

    expect(mockExecute).toHaveBeenCalledWith({
      priceId: "price_abc",
      userId: "user-1",
      successUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel",
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      url: "https://checkout.stripe.com/test",
      sessionId: "cs_test_123",
    });
  });

  it("should return 500 when use case throws", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Stripe error"));
    const request = createRequest();
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await createCheckoutHandler(
      request as unknown as Parameters<typeof createCheckoutHandler>[0],
      reply as unknown as Parameters<typeof createCheckoutHandler>[1],
    );

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Stripe error",
    });
  });
});
