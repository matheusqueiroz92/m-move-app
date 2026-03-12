import type { FastifyReply, FastifyRequest } from "fastify";

import { DayNotFoundError } from "../../../../domain/workout/errors/day-not-found.error.js";
import { StartWorkoutSessionUseCase } from "../../../../application/workout/start-workout-session.use-case.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";
import { PrismaWorkoutSessionRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-session.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const workoutSessionRepository = new PrismaWorkoutSessionRepository();
const startWorkoutSessionUseCase = new StartWorkoutSessionUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutSessionRepository,
);

export async function startSessionHandler(
  request: FastifyRequest<{
    Body: { workoutDayId: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const session = await startWorkoutSessionUseCase.execute({
      userId,
      workoutDayId: request.body.workoutDayId,
    });
    return reply.status(201).send({
      ...session,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof DayNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
