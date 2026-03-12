import type { WorkoutSession } from "../../../../generated/prisma/client.js";
import type { WorkoutSessionResult } from "../../../../domain/workout/repositories/workout-session.repository.js";

export function toWorkoutSessionResult(
  session: WorkoutSession,
): WorkoutSessionResult {
  return {
    id: session.id,
    userId: session.userId,
    workoutDayId: session.workoutDayId,
    startedAt: session.startedAt,
    completedAt: session.completedAt ?? null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
