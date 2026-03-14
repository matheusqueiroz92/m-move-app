import { describe, expect, it, vi } from "vitest";

import { PtInviteNotFoundError } from "../../domain/pt-invite/errors/pt-invite-not-found.error.js";
import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";
import { RevokePtInviteUseCase } from "./revoke-pt-invite.use-case.js";

describe("RevokePtInviteUseCase", () => {
  it("should revoke invite when it exists and belongs to PT", async () => {
    const revoked: PtStudentLinkResult = {
      id: "link-1",
      personalTrainerId: "pt-1",
      studentId: null,
      inviteEmail: "a@test.dev",
      inviteToken: "t1",
      inviteExpiresAt: new Date(),
      status: "REVOKED",
      acceptedAt: null,
      revokedAt: new Date(),
      createdAt: new Date(),
    };
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "link-1",
        personalTrainerId: "pt-1",
      }),
      findByToken: vi.fn(),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(revoked),
    };
    const useCase = new RevokePtInviteUseCase(repository);

    await useCase.execute({ inviteId: "link-1", personalTrainerId: "pt-1" });

    expect(repository.updateStatus).toHaveBeenCalledWith(
      "link-1",
      "REVOKED",
      undefined,
      expect.any(Date),
      undefined,
    );
  });

  it("should throw PtInviteNotFoundError when invite does not exist", async () => {
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByToken: vi.fn(),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new RevokePtInviteUseCase(repository);

    await expect(
      useCase.execute({ inviteId: "link-404", personalTrainerId: "pt-1" }),
    ).rejects.toThrow(PtInviteNotFoundError);
  });

  it("should throw PtInviteNotFoundError when invite belongs to another PT", async () => {
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "link-1",
        personalTrainerId: "other-pt",
      }),
      findByToken: vi.fn(),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new RevokePtInviteUseCase(repository);

    await expect(
      useCase.execute({ inviteId: "link-1", personalTrainerId: "pt-1" }),
    ).rejects.toThrow(PtInviteNotFoundError);
  });
});
