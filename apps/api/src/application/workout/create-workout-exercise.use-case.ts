import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type {
  CreateWorkoutExerciseInput,
  WorkoutExerciseRepository,
  WorkoutExerciseResult,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";

export interface CreateWorkoutExerciseUseCaseInput {
  dayId: string;
  userId: string;
  name: string;
  order: number;
  description?: string | null;
  sets: number;
  reps: number;
  weightKg?: number | null;
  restTimeInSeconds: number;
  notes?: string | null;
}

export class CreateWorkoutExerciseUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
    private readonly workoutExerciseRepository: WorkoutExerciseRepository,
  ) {}

  async execute(
    input: CreateWorkoutExerciseUseCaseInput,
  ): Promise<WorkoutExerciseResult> {
    await this.verifyDayOwnership(input.dayId, input.userId);
    return this.workoutExerciseRepository.create({
      workoutDayId: input.dayId,
      name: input.name,
      order: input.order,
      description: input.description,
      sets: input.sets,
      reps: input.reps,
      weightKg: input.weightKg,
      restTimeInSeconds: input.restTimeInSeconds,
      notes: input.notes,
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
