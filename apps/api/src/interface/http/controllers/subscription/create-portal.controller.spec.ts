import { describe, expect, it, vi } from "vitest";

import { createPortalHandler } from "./create-portal.controller.js";

const mockExecute = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ url: "https://billing.stripe.com/session" }),
);

function createRequest(
  overrides: { userId?: string; body?: { returnUrl: string } } = {},
) {
  return {
    userId: "user-1",
    body: { returnUrl: "https://app.test/billing" },
    server: {
      useCases: {
        createPortalSession: { execute: mockExecute },
      },
    },
    ...overrides,
  };
}

describe("createPortalHandler", () => {
  it("should return 200 and portal url when use case succeeds", async () => {
    const request = createRequest();
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await createPortalHandler(
      request as unknown as Parameters<typeof createPortalHandler>[0],
      reply as unknown as Parameters<typeof createPortalHandler>[1],
    );

    expect(mockExecute).toHaveBeenCalledWith({
      userId: "user-1",
      returnUrl: "https://app.test/billing",
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      url: "https://billing.stripe.com/session",
    });
  });

  it("should propagate error when user has no Stripe customer (handled by global error handler)", async () => {
    mockExecute.mockRejectedValueOnce(new Error("User has no Stripe customer"));
    const request = createRequest();
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await expect(
      createPortalHandler(
        request as unknown as Parameters<typeof createPortalHandler>[0],
        reply as unknown as Parameters<typeof createPortalHandler>[1],
      ),
    ).rejects.toThrow("User has no Stripe customer");
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should propagate error when use case throws (handled by global error handler)", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Portal error"));
    const request = createRequest();
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await expect(
      createPortalHandler(
        request as unknown as Parameters<typeof createPortalHandler>[0],
        reply as unknown as Parameters<typeof createPortalHandler>[1],
      ),
    ).rejects.toThrow("Portal error");
    expect(reply.status).not.toHaveBeenCalled();
  });
});
