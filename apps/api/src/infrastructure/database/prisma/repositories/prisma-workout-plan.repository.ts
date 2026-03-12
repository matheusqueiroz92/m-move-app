import type {
  CreateWorkoutPlanInput,
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../../../domain/workout/repositories/workout-plant.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toWorkoutPlanResult } from "../mappers/workout-plan.mapper.js";

export class PrismaWorkoutPlanRepository implements WorkoutPlanRepository {
  async create(input: CreateWorkoutPlanInput): Promise<WorkoutPlanResult> {
    const plan = await prisma.workoutPlan.create({
      data: {
        name: input.name,
        description: input.description ?? undefined,
        userId: input.userId,
        createdBy: input.createdBy ?? undefined,
      },
    });
    return toWorkoutPlanResult(plan);
  }

  async findByUserId(userId: string): Promise<WorkoutPlanResult[]> {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return plans.map(toWorkoutPlanResult);
  }

  async findByIdAndUserId(
    planId: string,
    userId: string,
  ): Promise<WorkoutPlanResult | null> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });
    return plan ? toWorkoutPlanResult(plan) : null;
  }

  async deactivateAllByUserId(userId: string): Promise<void> {
    await prisma.workoutPlan.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async updateIsActive(
    planId: string,
    userId: string,
    isActive: boolean,
  ): Promise<WorkoutPlanResult | null> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return null;
    const updated = await prisma.workoutPlan.update({
      where: { id: planId },
      data: { isActive },
    });
    return toWorkoutPlanResult(updated);
  }
}
