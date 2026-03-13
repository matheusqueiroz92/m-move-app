import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";
import type { WorkoutSessionResult } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";

export interface StartWorkoutSessionInput {
  userId: string;
  workoutDayId: string;
}

export class StartWorkoutSessionUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(
    input: StartWorkoutSessionInput,
  ): Promise<WorkoutSessionResult> {
    await this.verifyDayOwnership(input.workoutDayId, input.userId);
    return this.workoutSessionRepository.create({
      userId: input.userId,
      workoutDayId: input.workoutDayId,
      startedAt: new Date(),
    });
  }

  private async verifyDayOwnership(
    dayId: string,
    userId: string,
  ): Promise<void> {
    const day = await this.workoutDayRepository.findById(dayId);
    if (!day) throw new DayNotFoundError(dayId);
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      day.workoutPlanId,
      userId,
    );
    if (!plan) throw new DayNotFoundError(dayId);
  }
}
