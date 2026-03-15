import type { FastifyReply, FastifyRequest } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserRepository } from "../../../domain/user/repositories/user.repository.js";
import { requireActivePlan } from "./require-active-plan.js";

function createRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    userId: "user-1",
    server: {
      userRepository: undefined as unknown as UserRepository,
    },
    ...overrides,
  } as FastifyRequest;
}

function createReply(): FastifyReply {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply as unknown as FastifyReply;
}

describe("requireActivePlan", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
      findByIdWithPlanAndTimezone: vi.fn(),
      findByIdWithSubscription: vi.fn(),
      getStripeCustomerId: vi.fn(),
      updateSubscriptionFields: vi.fn(),
    };
  });

  it("should allow when subscriptionStatus is ACTIVE", async () => {
    vi.mocked(userRepository.findByIdWithSubscription).mockResolvedValue({
      role: "STUDENT",
      planType: "STUDENT",
      subscriptionStatus: "ACTIVE",
    });
    const request = createRequest();
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should allow when subscriptionStatus is TRIALING", async () => {
    vi.mocked(userRepository.findByIdWithSubscription).mockResolvedValue({
      role: "PERSONAL_TRAINER",
      planType: "PERSONAL",
      subscriptionStatus: "TRIALING",
    });
    const request = createRequest();
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should allow when role is LINKED_STUDENT (no own plan)", async () => {
    vi.mocked(userRepository.findByIdWithSubscription).mockResolvedValue({
      role: "LINKED_STUDENT",
      planType: null,
      subscriptionStatus: null,
    });
    const request = createRequest();
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should allow when role is INSTRUCTOR (no own plan)", async () => {
    vi.mocked(userRepository.findByIdWithSubscription).mockResolvedValue({
      role: "INSTRUCTOR",
      planType: null,
      subscriptionStatus: null,
    });
    const request = createRequest();
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should return 401 when userId is missing", async () => {
    const request = createRequest({ userId: undefined });
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 when user not found", async () => {
    vi.mocked(userRepository.findByIdWithSubscription).mockResolvedValue(null);
    const request = createRequest();
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 403 when subscriptionStatus is not active (STUDENT)", async () => {
    vi.mocked(userRepository.findByIdWithSubscription).mockResolvedValue({
      role: "STUDENT",
      planType: "STUDENT",
      subscriptionStatus: "CANCELED",
    });
    const request = createRequest();
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Active subscription required",
      code: "SUBSCRIPTION_REQUIRED",
    });
  });

  it("should return 403 when subscriptionStatus is PAST_DUE", async () => {
    vi.mocked(userRepository.findByIdWithSubscription).mockResolvedValue({
      role: "OWNER",
      planType: "GYM",
      subscriptionStatus: "PAST_DUE",
    });
    const request = createRequest();
    request.server.userRepository = userRepository;
    const reply = createReply();

    await requireActivePlan(request, reply);

    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Active subscription required",
      code: "SUBSCRIPTION_REQUIRED",
    });
  });
});
