import { AssessmentNotFoundError } from "../../domain/assessment/errors/assessment-not-found.error.js";
import type {
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../domain/assessment/repositories/physical-assessment.repository.js";

export interface GetPhysicalAssessmentByIdInput {
  id: string;
}

export class GetPhysicalAssessmentByIdUseCase {
  constructor(
    private readonly physicalAssessmentRepository: PhysicalAssessmentRepository,
  ) {}

  async execute(
    input: GetPhysicalAssessmentByIdInput,
  ): Promise<PhysicalAssessmentResult> {
    const assessment =
      await this.physicalAssessmentRepository.findById(input.id);
    if (!assessment) {
      throw new AssessmentNotFoundError(input.id);
    }
    return assessment;
  }
}
