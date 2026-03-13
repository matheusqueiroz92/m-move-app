import type { FastifyReply, FastifyRequest } from "fastify";

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

  const result = await request.server.useCases.getStreak.execute({
    userId,
    timezone: request.query.timezone,
  });

  return reply.status(200).send(result);
}
