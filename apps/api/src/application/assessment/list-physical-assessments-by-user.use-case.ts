import type {
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../domain/assessment/repositories/physical-assessment.repository.js";

export interface ListPhysicalAssessmentsByUserInput {
  userId: string;
  limit: number;
  offset: number;
}

export interface ListPhysicalAssessmentsByUserResult {
  items: PhysicalAssessmentResult[];
  total: number;
  limit: number;
  offset: number;
}

export class ListPhysicalAssessmentsByUserUseCase {
  constructor(
    private readonly physicalAssessmentRepository: PhysicalAssessmentRepository,
  ) {}

  async execute(
    input: ListPhysicalAssessmentsByUserInput,
  ): Promise<ListPhysicalAssessmentsByUserResult> {
    const { items, total } =
      await this.physicalAssessmentRepository.findByUserIdPaginated(
        input.userId,
        { limit: input.limit, offset: input.offset },
      );
    return {
      items,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }
}
