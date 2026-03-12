import type { WorkoutPlan } from "../../../../generated/prisma/client.js";
import type { WorkoutPlanResult } from "../../../../domain/workout/repositories/workout-plant.repository.js";

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
