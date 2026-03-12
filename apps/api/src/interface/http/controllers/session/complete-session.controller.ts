import type { FastifyReply, FastifyRequest } from "fastify";

import { SessionNotFoundError } from "../../../../domain/workout/errors/session-not-found.error.js";
import { CompleteWorkoutSessionUseCase } from "../../../../application/workout/complete-workout-session.use-case.js";
import { PrismaWorkoutSessionRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-session.repository.js";

const workoutSessionRepository = new PrismaWorkoutSessionRepository();
const completeWorkoutSessionUseCase = new CompleteWorkoutSessionUseCase(
  workoutSessionRepository,
);

export async function completeSessionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const session = await completeWorkoutSessionUseCase.execute({
      sessionId: request.params.id,
      userId,
    });
    return reply.status(200).send({
      ...session,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
