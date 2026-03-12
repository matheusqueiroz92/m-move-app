import type { WorkoutDay } from "../../../../generated/prisma/client.js";
import type { WorkoutDayResult } from "../../../../domain/workout/repositories/workout-day.repository.js";

export function toWorkoutDayResult(day: WorkoutDay): WorkoutDayResult {
  return {
    id: day.id,
    name: day.name,
    workoutPlanId: day.workoutPlanId,
    isRest: day.isRest,
    weekDay: day.weekDay,
    estimatedDurationInSeconds: day.estimatedDurationInSeconds ?? null,
    coverImageUrl: day.coverImageUrl ?? null,
    createdAt: day.createdAt,
    updatedAt: day.updatedAt,
  };
}
