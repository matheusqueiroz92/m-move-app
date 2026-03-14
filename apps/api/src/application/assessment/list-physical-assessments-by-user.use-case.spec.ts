import { describe, expect, it, vi } from "vitest";

import type {
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../domain/assessment/repositories/physical-assessment.repository.js";
import { ListPhysicalAssessmentsByUserUseCase } from "./list-physical-assessments-by-user.use-case.js";

describe("ListPhysicalAssessmentsByUserUseCase", () => {
  it("should return list of assessments for the user ordered by assessedAt desc", async () => {
    const list: PhysicalAssessmentResult[] = [
      {
        id: "assess-2",
        userId: "user-1",
        assessedBy: "pt-1",
        weightKg: 82,
        heightCm: 176,
        bodyFatPct: null,
        muscleMassPct: null,
        chestCm: null,
        waistCm: null,
        hipsCm: null,
        leftArmCm: null,
        rightArmCm: null,
        leftThighCm: null,
        rightThighCm: null,
        notes: null,
        assessedAt: new Date("2025-03-10"),
      },
      {
        id: "assess-1",
        userId: "user-1",
        assessedBy: null,
        weightKg: 80,
        heightCm: 175,
        bodyFatPct: null,
        muscleMassPct: null,
        chestCm: null,
        waistCm: null,
        hipsCm: null,
        leftArmCm: null,
        rightArmCm: null,
        leftThighCm: null,
        rightThighCm: null,
        notes: null,
        assessedAt: new Date("2025-03-01"),
      },
    ];
    const findByUserIdPaginated = vi.fn().mockResolvedValue({
      items: list,
      total: list.length,
    });
    const repository: PhysicalAssessmentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated,
    };
    const useCase = new ListPhysicalAssessmentsByUserUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual(list);
    expect(findByUserIdPaginated).toHaveBeenCalledWith("user-1", {
      limit: 20,
      offset: 0,
    });
  });

  it("should return empty items when user has no assessments", async () => {
    const repository: PhysicalAssessmentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    const useCase = new ListPhysicalAssessmentsByUserUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
