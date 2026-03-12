import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type {
  WorkoutExerciseResult,
  WorkoutExerciseRepository,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";

export interface ListWorkoutExercisesInput {
  dayId: string;
  userId: string;
}

export class ListWorkoutExercisesUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
    private readonly workoutExerciseRepository: WorkoutExerciseRepository,
  ) {}

  async execute(input: ListWorkoutExercisesInput): Promise<WorkoutExerciseResult[]> {
    await this.verifyDayOwnership(input.dayId, input.userId);
    return this.workoutExerciseRepository.findByDayId(input.dayId);
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
