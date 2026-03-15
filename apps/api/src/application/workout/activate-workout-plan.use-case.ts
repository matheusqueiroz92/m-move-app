import { PlanMustHaveAtLeastOneDayError } from "../../domain/workout/errors/plan-must-have-at-least-one-day.error.js";
import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";

export interface ActivateWorkoutPlanInput {
  planId: string;
  userId: string;
}

/** RF-006: Plan must have at least one WorkoutDay to be activated */
export class ActivateWorkoutPlanUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
  ) {}

  async execute(input: ActivateWorkoutPlanInput): Promise<WorkoutPlanResult> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }

    const days = await this.workoutDayRepository.findByPlanId(input.planId);
    if (days.length < 1) {
      throw new PlanMustHaveAtLeastOneDayError(input.planId);
    }

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
