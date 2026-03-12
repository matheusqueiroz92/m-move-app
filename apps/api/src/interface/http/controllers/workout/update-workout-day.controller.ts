import type { FastifyReply, FastifyRequest } from "fastify";

import { DayNotFoundError } from "../../../../domain/workout/errors/day-not-found.error.js";
import { PlanNotFoundError } from "../../../../domain/workout/errors/plan-not-found.error.js";
import { UpdateWorkoutDayUseCase } from "../../../../application/workout/update-workout-day.use-case.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const updateWorkoutDayUseCase = new UpdateWorkoutDayUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);

export async function updateWorkoutDayHandler(
  request: FastifyRequest<{
    Params: { planId: string; dayId: string };
    Body: {
      name?: string;
      isRest?: boolean;
      weekDay?: string;
      estimatedDurationInSeconds?: number | null;
      coverImageUrl?: string | null;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const body = request.body;
    const day = await updateWorkoutDayUseCase.execute({
      planId: request.params.planId,
      dayId: request.params.dayId,
      userId,
      name: body.name,
      isRest: body.isRest,
      weekDay: body.weekDay as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY" | undefined,
      estimatedDurationInSeconds: body.estimatedDurationInSeconds,
      coverImageUrl: body.coverImageUrl,
    });
    return reply.status(200).send({
      ...day,
      createdAt: day.createdAt.toISOString(),
      updatedAt: day.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof PlanNotFoundError || error instanceof DayNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
