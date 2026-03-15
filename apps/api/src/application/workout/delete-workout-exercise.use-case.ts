import { CannotDeleteLastExerciseError } from "../../domain/workout/errors/cannot-delete-last-exercise.error.js";
import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { ExerciseNotFoundError } from "../../domain/workout/errors/exercise-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutExerciseRepository } from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";

export interface DeleteWorkoutExerciseInput {
  dayId: string;
  exerciseId: string;
  userId: string;
}

/** RF-008: WorkoutDay must have at least one Exercise; cannot delete the last one */
export class DeleteWorkoutExerciseUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
    private readonly workoutExerciseRepository: WorkoutExerciseRepository,
  ) {}

  async execute(input: DeleteWorkoutExerciseInput): Promise<void> {
    await this.verifyDayOwnership(input.dayId, input.userId);

    const exercises = await this.workoutExerciseRepository.findByDayId(
      input.dayId,
    );
    if (exercises.length <= 1) {
      throw new CannotDeleteLastExerciseError(input.dayId);
    }

    const deleted = await this.workoutExerciseRepository.delete(
      input.exerciseId,
      input.dayId,
    );
    if (!deleted) throw new ExerciseNotFoundError(input.exerciseId);
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
