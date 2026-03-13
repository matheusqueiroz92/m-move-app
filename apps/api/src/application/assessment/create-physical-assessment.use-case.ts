import type {
  CreatePhysicalAssessmentInput,
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../domain/assessment/repositories/physical-assessment.repository.js";

export class CreatePhysicalAssessmentUseCase {
  constructor(
    private readonly physicalAssessmentRepository: PhysicalAssessmentRepository,
  ) {}

  async execute(
    input: CreatePhysicalAssessmentInput,
  ): Promise<PhysicalAssessmentResult> {
    return this.physicalAssessmentRepository.create({
      userId: input.userId,
      assessedBy: input.assessedBy,
      weightKg: input.weightKg,
      heightCm: input.heightCm,
      bodyFatPct: input.bodyFatPct,
      muscleMassPct: input.muscleMassPct,
      chestCm: input.chestCm,
      waistCm: input.waistCm,
      hipsCm: input.hipsCm,
      leftArmCm: input.leftArmCm,
      rightArmCm: input.rightArmCm,
      leftThighCm: input.leftThighCm,
      rightThighCm: input.rightThighCm,
      notes: input.notes,
    });
  }
}
