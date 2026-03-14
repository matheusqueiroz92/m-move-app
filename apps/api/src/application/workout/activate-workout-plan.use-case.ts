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
    const updated = await this.workoutPlanRepository.activatePlanForUser(
      input.planId,
      input.userId,
    );
    if (!updated) {
      throw new PlanNotFoundError(input.planId);
    }
    return updated;
  }
}
