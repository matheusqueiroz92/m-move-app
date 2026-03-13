import type { WorkoutPlanResult } from "../../../../domain/workout/repositories/workout-plant.repository.js";
import type { WorkoutPlan } from "../../../../generated/prisma/client.js";

export function toWorkoutPlanResult(plan: WorkoutPlan): WorkoutPlanResult {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description ?? null,
    userId: plan.userId,
    createdBy: plan.createdBy ?? null,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}
