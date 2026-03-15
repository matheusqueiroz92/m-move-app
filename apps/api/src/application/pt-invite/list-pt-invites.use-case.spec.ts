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
    const findByPersonalTrainerIdPaginated = vi.fn().mockResolvedValue({
      items: links,
      total: links.length,
    });
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn(),
      countActiveByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated,
      updateStatus: vi.fn(),
    };
    const useCase = new ListPtInvitesUseCase(repository);

    const result = await useCase.execute({
      personalTrainerId: "pt-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual(links);
    expect(findByPersonalTrainerIdPaginated).toHaveBeenCalledWith("pt-1", {
      limit: 20,
      offset: 0,
    });
  });

  it("should return empty items when PT has no invites", async () => {
    const repository: PtStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByToken: vi.fn(),
      countActiveByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerId: vi.fn(),
      findByPersonalTrainerIdPaginated: vi.fn().mockResolvedValue({
        items: [],
        total: 0,
      }),
      updateStatus: vi.fn(),
    };
    const useCase = new ListPtInvitesUseCase(repository);

    const result = await useCase.execute({
      personalTrainerId: "pt-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
