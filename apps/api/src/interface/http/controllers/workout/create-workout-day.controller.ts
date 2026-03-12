import type { FastifyReply, FastifyRequest } from "fastify";

import { PlanNotFoundError } from "../../../../domain/workout/errors/plan-not-found.error.js";
import { CreateWorkoutDayUseCase } from "../../../../application/workout/create-workout-day.use-case.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const createWorkoutDayUseCase = new CreateWorkoutDayUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);

export async function createWorkoutDayHandler(
  request: FastifyRequest<{
    Params: { planId: string };
    Body: {
      name: string;
      isRest?: boolean;
      weekDay: string;
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
    const day = await createWorkoutDayUseCase.execute({
      planId: request.params.planId,
      userId,
      name: body.name,
      isRest: body.isRest,
      weekDay: body.weekDay as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY",
      estimatedDurationInSeconds: body.estimatedDurationInSeconds,
      coverImageUrl: body.coverImageUrl,
    });
    return reply.status(201).send({
      ...day,
      createdAt: day.createdAt.toISOString(),
      updatedAt: day.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof PlanNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
