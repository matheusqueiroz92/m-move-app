import { describe, expect, it, vi } from "vitest";

import { AssessmentNotFoundError } from "../../domain/assessment/errors/assessment-not-found.error.js";
import type {
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../domain/assessment/repositories/physical-assessment.repository.js";
import { GetPhysicalAssessmentByIdUseCase } from "./get-physical-assessment-by-id.use-case.js";

describe("GetPhysicalAssessmentByIdUseCase", () => {
  it("should return assessment when found", async () => {
    const assessment: PhysicalAssessmentResult = {
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
      assessedAt: new Date(),
    };
    const repository: PhysicalAssessmentRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(assessment),
      findByUserId: vi.fn(),
    };
    const useCase = new GetPhysicalAssessmentByIdUseCase(repository);

    const result = await useCase.execute({ id: "assess-1" });

    expect(result).toEqual(assessment);
    expect(repository.findById).toHaveBeenCalledWith("assess-1");
  });

  it("should throw AssessmentNotFoundError when assessment does not exist", async () => {
    const repository: PhysicalAssessmentRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByUserId: vi.fn(),
    };
    const useCase = new GetPhysicalAssessmentByIdUseCase(repository);

    await expect(
      useCase.execute({ id: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow(AssessmentNotFoundError);
  });
});
