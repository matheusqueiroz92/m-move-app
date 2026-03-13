import type { FastifyReply, FastifyRequest } from "fastify";

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

  const session = await request.server.useCases.startWorkoutSession.execute({
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
}
