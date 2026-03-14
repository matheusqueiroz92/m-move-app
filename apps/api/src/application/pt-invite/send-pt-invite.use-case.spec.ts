import { describe, expect, it, vi } from "vitest";

import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";
import { SendPtInviteUseCase } from "./send-pt-invite.use-case.js";

describe("SendPtInviteUseCase", () => {
  it("should create invite and return link when PT sends invite", async () => {
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
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new SendPtInviteUseCase(repository);

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
});
