import { describe, expect, it, vi } from "vitest";

import type {
  CreatePhysicalAssessmentInput,
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../domain/assessment/repositories/physical-assessment.repository.js";
import { CreatePhysicalAssessmentUseCase } from "./create-physical-assessment.use-case.js";

describe("CreatePhysicalAssessmentUseCase", () => {
  it("should create a physical assessment and return the created assessment", async () => {
    const assessedAt = new Date("2025-03-01T10:00:00Z");
    const created: PhysicalAssessmentResult = {
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
      assessedAt,
    };
    const create = vi.fn().mockResolvedValue(created);
    const repository: PhysicalAssessmentRepository = {
      create,
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
    };
    const useCase = new CreatePhysicalAssessmentUseCase(repository);

    const input: CreatePhysicalAssessmentInput = {
      userId: "user-1",
      weightKg: 80,
      heightCm: 175,
    };
    const result = await useCase.execute(input);

    expect(result).toEqual(created);
    expect(create).toHaveBeenCalledWith({
      userId: "user-1",
      assessedBy: undefined,
      weightKg: 80,
      heightCm: 175,
      bodyFatPct: undefined,
      muscleMassPct: undefined,
      chestCm: undefined,
      waistCm: undefined,
      hipsCm: undefined,
      leftArmCm: undefined,
      rightArmCm: undefined,
      leftThighCm: undefined,
      rightThighCm: undefined,
      notes: undefined,
    });
  });

  it("should create assessment with optional fields when provided", async () => {
    const created: PhysicalAssessmentResult = {
      id: "assess-2",
      userId: "user-1",
      assessedBy: "pt-1",
      weightKg: 82,
      heightCm: 176,
      bodyFatPct: 18,
      muscleMassPct: 42,
      chestCm: 100,
      waistCm: 85,
      hipsCm: 102,
      leftArmCm: 32,
      rightArmCm: 32,
      leftThighCm: 55,
      rightThighCm: 55,
      notes: "Bom progresso",
      assessedAt: new Date(),
    };
    const create = vi.fn().mockResolvedValue(created);
    const repository: PhysicalAssessmentRepository = {
      create,
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
    };
    const useCase = new CreatePhysicalAssessmentUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      assessedBy: "pt-1",
      weightKg: 82,
      heightCm: 176,
      bodyFatPct: 18,
      muscleMassPct: 42,
      chestCm: 100,
      waistCm: 85,
      hipsCm: 102,
      leftArmCm: 32,
      rightArmCm: 32,
      leftThighCm: 55,
      rightThighCm: 55,
      notes: "Bom progresso",
    });

    expect(result).toEqual(created);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        assessedBy: "pt-1",
        weightKg: 82,
        heightCm: 176,
        bodyFatPct: 18,
        notes: "Bom progresso",
      }),
    );
  });
});
