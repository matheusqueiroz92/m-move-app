import { describe, expect, it, vi } from "vitest";

import { PtStudentLimitReachedError } from "../../domain/pt-invite/errors/pt-student-limit-reached.error.js";
import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";
import { SendPtInviteUseCase } from "./send-pt-invite.use-case.js";

describe("SendPtInviteUseCase", () => {
  it("should create invite and return link when PT sends invite and under limit (RN-012)", async () => {
    const created: PtStudentLinkResult = {
      id: "link-1",
      personalTrainerId: "pt-1",
      studentId: null,
      inviteEmail: "aluno@test.dev",
      inviteToken: "token-abc",
      inviteExpiresAt: new Date("2025-04-01"),
      status: "PENDING",
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const create = vi.fn().mockResolvedValue(created);
    const repository: PtStudentLinkRepository = {
      create,
      findById: vi.fn(),
      findByToken: vi.fn(),
      countActiveByPersonalTrainerId: vi.fn().mockResolvedValue(5),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const userRepository: UserRepository = {
      findById: vi.fn(),
      findByIdWithSubscription: vi.fn(),
      findByIdWithPlanAndTimezone: vi.fn().mockResolvedValue({
        planType: "PERSONAL",
        timezone: "America/Sao_Paulo",
      }),
      getStripeCustomerId: vi.fn(),
      updateSubscriptionFields: vi.fn(),
    };
    const useCase = new SendPtInviteUseCase(repository, userRepository);

    const result = await useCase.execute({
      personalTrainerId: "pt-1",
      inviteEmail: "aluno@test.dev",
      inviteToken: "token-abc",
      inviteExpiresAt: new Date("2025-04-01"),
    });

    expect(result).toEqual(created);
    expect(create).toHaveBeenCalledWith({
      personalTrainerId: "pt-1",
      inviteEmail: "aluno@test.dev",
      inviteToken: "token-abc",
      inviteExpiresAt: new Date("2025-04-01"),
    });
  });

  it("should throw PtStudentLimitReachedError when PERSONAL PT has reached limit (RN-012)", async () => {
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn(),
      countActiveByPersonalTrainerId: vi.fn().mockResolvedValue(10),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const userRepository: UserRepository = {
      findById: vi.fn(),
      findByIdWithSubscription: vi.fn(),
      findByIdWithPlanAndTimezone: vi.fn().mockResolvedValue({
        planType: "PERSONAL",
        timezone: "America/Sao_Paulo",
      }),
      getStripeCustomerId: vi.fn(),
      updateSubscriptionFields: vi.fn(),
    };
    const useCase = new SendPtInviteUseCase(repository, userRepository);

    await expect(
      useCase.execute({
        personalTrainerId: "pt-1",
        inviteEmail: "aluno@test.dev",
        inviteToken: "token-abc",
        inviteExpiresAt: new Date("2025-04-01"),
      }),
    ).rejects.toThrow(PtStudentLimitReachedError);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
