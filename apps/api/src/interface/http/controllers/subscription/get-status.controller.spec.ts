import { describe, expect, it, vi } from "vitest";

import { getSubscriptionStatusHandler } from "./get-status.controller.js";

const mockExecute = vi.hoisted(() => vi.fn());

function createRequest(overrides: { userId?: string } = {}) {
  return {
    userId: "user-1",
    server: {
      useCases: {
        getSubscriptionStatus: { execute: mockExecute },
      },
    },
    ...overrides,
  };
}

describe("getSubscriptionStatusHandler", () => {
  it("should return 200 with null when user has no subscription", async () => {
    mockExecute.mockResolvedValueOnce(null);
    const request = createRequest();
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await getSubscriptionStatusHandler(
      request as Parameters<typeof getSubscriptionStatusHandler>[0],
      reply as Parameters<typeof getSubscriptionStatusHandler>[1],
    );

    expect(mockExecute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(null);
  });

  it("should return 200 with subscription when user has active subscription", async () => {
    const sub = {
      id: "sub_1",
      planType: "STUDENT",
      status: "ACTIVE",
      currentPeriodStart: new Date("2025-01-01"),
      currentPeriodEnd: new Date("2025-01-31"),
      trialEnd: null,
      createdAt: new Date("2024-12-01"),
      updatedAt: new Date("2025-01-01"),
    };
    mockExecute.mockResolvedValueOnce(sub);
    const request = createRequest();
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await getSubscriptionStatusHandler(
      request as Parameters<typeof getSubscriptionStatusHandler>[0],
      reply as Parameters<typeof getSubscriptionStatusHandler>[1],
    );

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      ...sub,
      currentPeriodStart: "2025-01-01T00:00:00.000Z",
      currentPeriodEnd: "2025-01-31T00:00:00.000Z",
      trialEnd: null,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    });
  });
});
