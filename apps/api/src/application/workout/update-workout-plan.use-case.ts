import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";

export interface UpdateWorkoutPlanUseCaseInput {
  planId: string;
  userId: string;
  name?: string;
  description?: string | null;
}

export class UpdateWorkoutPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: UpdateWorkoutPlanUseCaseInput): Promise<WorkoutPlanResult> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }
    const updated = await this.workoutPlanRepository.update(
      input.planId,
      input.userId,
      {
        name: input.name,
        description: input.description,
      },
    );
    if (!updated) {
      throw new PlanNotFoundError(input.planId);
    }
    return updated;
  }
}
