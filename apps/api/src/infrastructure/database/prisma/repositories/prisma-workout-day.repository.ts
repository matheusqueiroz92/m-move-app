import type {
  CreateWorkoutDayInput,
  UpdateWorkoutDayInput,
  WorkoutDayRepository,
  WorkoutDayResult,
} from "../../../../domain/workout/repositories/workout-day.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toWorkoutDayResult } from "../mappers/workout-day.mapper.js";

export class PrismaWorkoutDayRepository implements WorkoutDayRepository {
  async create(input: CreateWorkoutDayInput): Promise<WorkoutDayResult> {
    const day = await prisma.workoutDay.create({
      data: {
        name: input.name,
        workoutPlanId: input.workoutPlanId,
        isRest: input.isRest ?? false,
        weekDay: input.weekDay,
        estimatedDurationInSeconds:
          input.estimatedDurationInSeconds ?? undefined,
        coverImageUrl: input.coverImageUrl ?? undefined,
      },
    });
    return toWorkoutDayResult(day);
  }

  async findById(dayId: string): Promise<WorkoutDayResult | null> {
    const day = await prisma.workoutDay.findUnique({
      where: { id: dayId },
    });
    return day ? toWorkoutDayResult(day) : null;
  }

  async findByPlanId(workoutPlanId: string): Promise<WorkoutDayResult[]> {
    const days = await prisma.workoutDay.findMany({
      where: { workoutPlanId },
      orderBy: { createdAt: "asc" },
    });
    return days.map(toWorkoutDayResult);
  }

  async findByIdAndPlanId(
    dayId: string,
    workoutPlanId: string,
  ): Promise<WorkoutDayResult | null> {
    const day = await prisma.workoutDay.findFirst({
      where: { id: dayId, workoutPlanId },
    });
    return day ? toWorkoutDayResult(day) : null;
  }

  async update(
    dayId: string,
    workoutPlanId: string,
    input: UpdateWorkoutDayInput,
  ): Promise<WorkoutDayResult | null> {
    const existing = await prisma.workoutDay.findFirst({
      where: { id: dayId, workoutPlanId },
    });
    if (!existing) return null;
    const updated = await prisma.workoutDay.update({
      where: { id: dayId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.isRest !== undefined && { isRest: input.isRest }),
        ...(input.weekDay !== undefined && { weekDay: input.weekDay }),
        ...(input.estimatedDurationInSeconds !== undefined && {
          estimatedDurationInSeconds: input.estimatedDurationInSeconds,
        }),
        ...(input.coverImageUrl !== undefined && {
          coverImageUrl: input.coverImageUrl,
        }),
      },
    });
    return toWorkoutDayResult(updated);
  }

  async delete(dayId: string, workoutPlanId: string): Promise<boolean> {
    const result = await prisma.workoutDay.deleteMany({
      where: { id: dayId, workoutPlanId },
    });
    return result.count > 0;
  }
}
