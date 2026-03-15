import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type {
  WorkoutExerciseRepository,
  WorkoutExerciseResult,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";

export interface CreateWorkoutExerciseUseCaseInput {
  dayId: string;
  userId: string;
  name: string;
  /** RF-011: Ignored; order is computed as 0 when no exercises, else max(existing order) + 1 */
  order?: number;
  description?: string | null;
  sets: number;
  reps: number;
  weightKg?: number | null;
  restTimeInSeconds: number;
  notes?: string | null;
}

/** RF-011: Order is auto-assigned: 0 when day has no exercises, else last order + 1 */
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

    const existing = await this.workoutExerciseRepository.findByDayId(
      input.dayId,
    );
    const order =
      existing.length === 0
        ? 0
        : Math.max(...existing.map((e) => e.order), -1) + 1;

    return this.workoutExerciseRepository.create({
      workoutDayId: input.dayId,
      name: input.name,
      order,
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
