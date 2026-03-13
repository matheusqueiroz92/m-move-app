import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";

export interface ActivateWorkoutPlanInput {
  planId: string;
  userId: string;
}

export class ActivateWorkoutPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: ActivateWorkoutPlanInput): Promise<WorkoutPlanResult> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }

    await this.workoutPlanRepository.deactivateAllByUserId(input.userId);
    const updated = await this.workoutPlanRepository.updateIsActive(
      input.planId,
      input.userId,
      true,
    );
    if (!updated) {
      throw new PlanNotFoundError(input.planId);
    }
    return updated;
  }
}
