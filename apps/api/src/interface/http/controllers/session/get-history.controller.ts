import type { FastifyReply, FastifyRequest } from "fastify";

import { GetSessionHistoryUseCase } from "../../../../application/workout/get-session-history.use-case.js";
import { PrismaWorkoutSessionRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-session.repository.js";

const workoutSessionRepository = new PrismaWorkoutSessionRepository();
const getSessionHistoryUseCase = new GetSessionHistoryUseCase(
  workoutSessionRepository,
);

export async function getSessionHistoryHandler(
  request: FastifyRequest<{
    Querystring: { limit?: string; offset?: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const limit = request.query.limit ? parseInt(request.query.limit, 10) : 50;
  const offset = request.query.offset
    ? parseInt(request.query.offset, 10)
    : 0;

  const sessions = await getSessionHistoryUseCase.execute({
    userId,
    limit,
    offset,
  });

  const body = sessions.map((s) => ({
    ...s,
    startedAt: s.startedAt.toISOString(),
    completedAt: s.completedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return reply.status(200).send(body);
}
