import type { FastifyReply, FastifyRequest } from "fastify";

import { GetStreakUseCase } from "../../../../application/workout/get-streak.use-case.js";
import { PrismaWorkoutSessionRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-session.repository.js";

const workoutSessionRepository = new PrismaWorkoutSessionRepository();
const getStreakUseCase = new GetStreakUseCase(workoutSessionRepository);

export async function getStreakHandler(
  request: FastifyRequest<{
    Querystring: { timezone?: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const result = await getStreakUseCase.execute({
    userId,
    timezone: request.query.timezone,
  });

  return reply.status(200).send(result);
}
