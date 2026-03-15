import type { UserRepository } from "../../domain/user/repositories/user.repository.js";
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
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ListWorkoutPlansInput): Promise<ListWorkoutPlansResult> {
    const user = await this.userRepository.findById(input.userId);
    const isLinkedStudent = user?.role === "LINKED_STUDENT";

    const { items, total } = isLinkedStudent
      ? await this.workoutPlanRepository.findAssignedPlansByUserIdPaginated(
          input.userId,
          { limit: input.limit, offset: input.offset },
        )
      : await this.workoutPlanRepository.findByUserIdPaginated(input.userId, {
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
