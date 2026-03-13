import type { FastifyReply, FastifyRequest } from "fastify";

export async function getStreakHandler(
  request: FastifyRequest<{
    Querystring: { timezone?: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const result = await request.server.useCases.getStreak.execute({
    userId,
    timezone: request.query.timezone,
  });

  return reply.status(200).send(result);
}
