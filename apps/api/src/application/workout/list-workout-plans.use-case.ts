import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";

export interface ListWorkoutPlansInput {
  userId: string;
  limit: number;
  offset: number;
}

export interface ListWorkoutPlansResult {
  items: WorkoutPlanResult[];
  total: number;
  limit: number;
  offset: number;
}

export class ListWorkoutPlansUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: ListWorkoutPlansInput): Promise<ListWorkoutPlansResult> {
    const { items, total } =
      await this.workoutPlanRepository.findByUserIdPaginated(input.userId, {
        limit: input.limit,
        offset: input.offset,
      });
    return {
      items,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }
}
