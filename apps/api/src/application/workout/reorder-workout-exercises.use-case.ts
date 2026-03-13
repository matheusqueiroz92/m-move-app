import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type {
  WorkoutExerciseRepository,
  WorkoutExerciseResult,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";

export interface ReorderWorkoutExercisesInput {
  dayId: string;
  userId: string;
  exerciseIdsInOrder: string[];
}

export class ReorderWorkoutExercisesUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
    private readonly workoutExerciseRepository: WorkoutExerciseRepository,
  ) {}

  async execute(
    input: ReorderWorkoutExercisesInput,
  ): Promise<WorkoutExerciseResult[]> {
    await this.verifyDayOwnership(input.dayId, input.userId);
    return this.workoutExerciseRepository.reorder(
      input.dayId,
      input.exerciseIdsInOrder,
    );
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
