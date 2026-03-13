import type {
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../domain/assessment/repositories/physical-assessment.repository.js";

export interface ListPhysicalAssessmentsByUserInput {
  userId: string;
}

export class ListPhysicalAssessmentsByUserUseCase {
  constructor(
    private readonly physicalAssessmentRepository: PhysicalAssessmentRepository,
  ) {}

  async execute(
    input: ListPhysicalAssessmentsByUserInput,
  ): Promise<PhysicalAssessmentResult[]> {
    return this.physicalAssessmentRepository.findByUserId(input.userId);
  }
}
