import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutDayRepository,
  WorkoutDayResult,
} from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";

export interface ListWorkoutDaysInput {
  planId: string;
  userId: string;
}

export class ListWorkoutDaysUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
  ) {}

  async execute(input: ListWorkoutDaysInput): Promise<WorkoutDayResult[]> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }
    return this.workoutDayRepository.findByPlanId(input.planId);
  }
}
