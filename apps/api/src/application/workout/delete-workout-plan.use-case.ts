import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";

export interface DeleteWorkoutPlanUseCaseInput {
  planId: string;
  userId: string;
}

export class DeleteWorkoutPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: DeleteWorkoutPlanUseCaseInput): Promise<void> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }
    const deleted = await this.workoutPlanRepository.delete(
      input.planId,
      input.userId,
    );
    if (!deleted) {
      throw new PlanNotFoundError(input.planId);
    }
  }
}
