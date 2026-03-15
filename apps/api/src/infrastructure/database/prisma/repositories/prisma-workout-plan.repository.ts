import type {
  CreateWorkoutPlanFullInput,
  CreateWorkoutPlanInput,
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../../../domain/workout/repositories/workout-plan.repository.js";
import type { WeekDay } from "../../../../generated/prisma/client.js";
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

  async createWithDaysAndExercises(
    input: CreateWorkoutPlanFullInput,
  ): Promise<WorkoutPlanResult> {
    const plan = await prisma.workoutPlan.create({
      data: {
        name: input.name,
        description: input.description ?? undefined,
        userId: input.userId,
        createdBy: input.createdBy ?? undefined,
        workoutDays: {
          create: input.days.map((d) => ({
            name: d.name,
            isRest: d.isRest,
            weekDay: d.weekDay as WeekDay,
            estimatedDurationInSeconds: d.estimatedDurationInSeconds ?? undefined,
            exercises: {
              create: d.exercises.map((e) => ({
                name: e.name,
                order: e.order,
                sets: e.sets,
                reps: e.reps,
                restTimeInSeconds: e.restTimeInSeconds,
                description: e.description ?? undefined,
                notes: e.notes ?? undefined,
              })),
            },
          })),
        },
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

  async findByUserIdPaginated(
    userId: string,
    options: { limit: number; offset: number },
  ) {
    const [items, total] = await Promise.all([
      prisma.workoutPlan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: options.limit,
        skip: options.offset,
      }),
      prisma.workoutPlan.count({ where: { userId } }),
    ]);
    return {
      items: items.map(toWorkoutPlanResult),
      total,
    };
  }

  async findAssignedPlansByUserIdPaginated(
    userId: string,
    options: { limit: number; offset: number },
  ) {
    const [items, total] = await Promise.all([
      prisma.workoutPlan.findMany({
        where: { userId, createdBy: { not: null } },
        orderBy: { createdAt: "desc" },
        take: options.limit,
        skip: options.offset,
      }),
      prisma.workoutPlan.count({
        where: { userId, createdBy: { not: null } },
      }),
    ]);
    return {
      items: items.map(toWorkoutPlanResult),
      total,
    };
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

  async activatePlanForUser(
    planId: string,
    userId: string,
  ): Promise<WorkoutPlanResult | null> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return null;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.workoutPlan.updateMany({
        where: { userId },
        data: { isActive: false },
      });
      return tx.workoutPlan.update({
        where: { id: planId },
        data: { isActive: true },
      });
    });
    return toWorkoutPlanResult(updated);
  }

  async update(
    planId: string,
    userId: string,
    data: { name?: string; description?: string | null },
  ): Promise<WorkoutPlanResult | null> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return null;
    const updated = await prisma.workoutPlan.update({
      where: { id: planId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
    return toWorkoutPlanResult(updated);
  }

  async delete(planId: string, userId: string): Promise<boolean> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return false;
    await prisma.workoutPlan.delete({
      where: { id: planId },
    });
    return true;
  }
}
