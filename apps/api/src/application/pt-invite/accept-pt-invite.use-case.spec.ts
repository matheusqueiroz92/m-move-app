import { describe, expect, it, vi } from "vitest";

import { InviteAlreadyUsedError } from "../../domain/pt-invite/errors/invite-already-used.error.js";
import { InviteExpiredError } from "../../domain/pt-invite/errors/invite-expired.error.js";
import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";
import { AcceptPtInviteUseCase } from "./accept-pt-invite.use-case.js";

describe("AcceptPtInviteUseCase", () => {
  it("should accept invite when token is valid and not expired", async () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const link: PtStudentLinkResult = {
      id: "link-1",
      personalTrainerId: "pt-1",
      studentId: null,
      inviteEmail: "aluno@test.dev",
      inviteToken: "token-valid",
      inviteExpiresAt: future,
      status: "PENDING",
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const updated: PtStudentLinkResult = {
      ...link,
      studentId: "student-1",
      status: "ACTIVE",
      acceptedAt: new Date(),
    };
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn().mockResolvedValue(link),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(updated),
    };
    const useCase = new AcceptPtInviteUseCase(repository);

    const result = await useCase.execute({
      token: "token-valid",
      studentId: "student-1",
    });

    expect(result).toEqual(updated);
    expect(repository.updateStatus).toHaveBeenCalledWith(
      "link-1",
      "ACTIVE",
      expect.any(Date),
      undefined,
      "student-1",
    );
  });

  it("should throw InviteExpiredError when invite is expired", async () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const link: PtStudentLinkResult = {
      id: "link-1",
      personalTrainerId: "pt-1",
      studentId: null,
      inviteEmail: "a@test.dev",
      inviteToken: "token-expired",
      inviteExpiresAt: past,
      status: "PENDING",
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn().mockResolvedValue(link),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new AcceptPtInviteUseCase(repository);

    await expect(
      useCase.execute({ token: "token-expired", studentId: "student-1" }),
    ).rejects.toThrow(InviteExpiredError);
  });

  it("should throw InviteAlreadyUsedError when invite is not PENDING", async () => {
    const link: PtStudentLinkResult = {
      id: "link-1",
      personalTrainerId: "pt-1",
      studentId: "student-1",
      inviteEmail: "a@test.dev",
      inviteToken: "token-used",
      inviteExpiresAt: new Date(Date.now() + 86400000),
      status: "ACTIVE",
      acceptedAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    };
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn().mockResolvedValue(link),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new AcceptPtInviteUseCase(repository);

    await expect(
      useCase.execute({ token: "token-used", studentId: "student-2" }),
    ).rejects.toThrow(InviteAlreadyUsedError);
  });

  it("should throw InviteExpiredError when token not found", async () => {
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn().mockResolvedValue(null),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new AcceptPtInviteUseCase(repository);

    await expect(
      useCase.execute({ token: "token-invalid", studentId: "student-1" }),
    ).rejects.toThrow(InviteExpiredError);
  });
});
