import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";

export interface DeleteWorkoutDayInput {
  planId: string;
  dayId: string;
  userId: string;
}

export class DeleteWorkoutDayUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
  ) {}

  async execute(input: DeleteWorkoutDayInput): Promise<void> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }
    const deleted = await this.workoutDayRepository.delete(
      input.dayId,
      input.planId,
    );
    if (!deleted) {
      throw new DayNotFoundError(input.dayId);
    }
  }
}
