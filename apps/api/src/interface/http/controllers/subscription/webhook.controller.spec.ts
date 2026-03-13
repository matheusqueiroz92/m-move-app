import { describe, expect, it, vi } from "vitest";

import { stripeWebhookHandler } from "./webhook.controller.js";

const mockExecute = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

const mockEnv = vi.hoisted(() => ({
  STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
}));
vi.mock("../../../../lib/env.js", () => ({ env: mockEnv }));

function createRequest(overrides: {
  body?: Buffer | string;
  headers?: Record<string, string>;
} = {}) {
  return {
    body: Buffer.from(JSON.stringify({ type: "test" })),
    headers: { "stripe-signature": "v1,sig123" },
    server: {
      useCases: {
        handleStripeWebhook: { execute: mockExecute },
      },
    },
    ...overrides,
  };
}

describe("stripeWebhookHandler", () => {
  it("should return 400 when stripe-signature header is missing", async () => {
    const request = createRequest({ headers: {} });
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await stripeWebhookHandler(
      request as Parameters<typeof stripeWebhookHandler>[0],
      reply as unknown as Parameters<typeof stripeWebhookHandler>[1],
    );

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Missing stripe-signature header",
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("should return 200 when use case succeeds", async () => {
    const request = createRequest({
      body: Buffer.from(JSON.stringify({ type: "checkout.session.completed" })),
      headers: { "stripe-signature": "v1,sig123" },
    });
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await stripeWebhookHandler(
      request as unknown as Parameters<typeof stripeWebhookHandler>[0],
      reply as unknown as Parameters<typeof stripeWebhookHandler>[1],
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        signature: "v1,sig123",
        secret: "whsec_test_secret",
      }),
    );
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ received: true });
  });

  it("should convert string body to Buffer", async () => {
    mockExecute.mockClear();
    const request = createRequest({
      body: '{"type":"test"}',
      headers: { "stripe-signature": "v1,sig" },
    });
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await stripeWebhookHandler(
      request as unknown as Parameters<typeof stripeWebhookHandler>[0],
      reply as unknown as Parameters<typeof stripeWebhookHandler>[1],
    );

    expect(mockExecute).toHaveBeenCalled();
    const callPayload =
      mockExecute.mock.calls?.[mockExecute.mock.calls.length - 1]?.[0]?.payload;
    expect(Buffer.isBuffer(callPayload)).toBe(true);
    expect(callPayload.toString()).toBe('{"type":"test"}');
  });

  it("should return 500 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
    const orig = mockEnv.STRIPE_WEBHOOK_SECRET;
    mockEnv.STRIPE_WEBHOOK_SECRET = undefined as unknown as string;
    const callCountBefore = mockExecute.mock.calls.length;
    const request = createRequest({
      body: Buffer.from("{}"),
      headers: { "stripe-signature": "v1,x" },
    });
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await stripeWebhookHandler(
      request as unknown as Parameters<typeof stripeWebhookHandler>[0],
      reply as unknown as Parameters<typeof stripeWebhookHandler>[1],
    );

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Webhook secret not configured",
    });
    mockEnv.STRIPE_WEBHOOK_SECRET = orig;
    expect(mockExecute.mock.calls.length).toBe(callCountBefore);
  });

  it("should return 400 when use case throws", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Invalid signature"));
    const request = createRequest({
      body: Buffer.from("{}"),
      headers: { "stripe-signature": "invalid" },
    });
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await stripeWebhookHandler(
      request as unknown as Parameters<typeof stripeWebhookHandler>[0],
      reply as unknown as Parameters<typeof stripeWebhookHandler>[1],
    );

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Invalid signature",
    });
  });
});
