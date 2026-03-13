import type { WorkoutExerciseResult } from "../../../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutExercise } from "../../../../generated/prisma/client.js";

export function toWorkoutExerciseResult(
  exercise: WorkoutExercise,
): WorkoutExerciseResult {
  return {
    id: exercise.id,
    name: exercise.name,
    order: exercise.order,
    workoutDayId: exercise.workoutDayId,
    description: exercise.description ?? null,
    sets: exercise.sets,
    reps: exercise.reps,
    weightKg: exercise.weightKg ?? null,
    restTimeInSeconds: exercise.restTimeInSeconds,
    notes: exercise.notes ?? null,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
  };
}
