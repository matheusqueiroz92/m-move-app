import { describe, expect, it, vi } from "vitest";

import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";
import { ListPtInvitesUseCase } from "./list-pt-invites.use-case.js";

describe("ListPtInvitesUseCase", () => {
  it("should return list of invites for the PT", async () => {
    const links: PtStudentLinkResult[] = [
      {
        id: "link-1",
        personalTrainerId: "pt-1",
        studentId: null,
        inviteEmail: "a@test.dev",
        inviteToken: "t1",
        inviteExpiresAt: new Date(),
        status: "PENDING",
        acceptedAt: null,
        revokedAt: null,
        createdAt: new Date(),
      },
    ];
    const findByPersonalTrainerId = vi.fn().mockResolvedValue(links);
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn(),
      findByPersonalTrainerId,
      updateStatus: vi.fn(),
    };
    const useCase = new ListPtInvitesUseCase(repository);

    const result = await useCase.execute({ personalTrainerId: "pt-1" });

    expect(result).toEqual(links);
    expect(findByPersonalTrainerId).toHaveBeenCalledWith("pt-1");
  });

  it("should return empty array when PT has no invites", async () => {
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn(),
      findByPersonalTrainerId: vi.fn().mockResolvedValue([]),
      updateStatus: vi.fn(),
    };
    const useCase = new ListPtInvitesUseCase(repository);

    const result = await useCase.execute({ personalTrainerId: "pt-1" });

    expect(result).toEqual([]);
  });
});
