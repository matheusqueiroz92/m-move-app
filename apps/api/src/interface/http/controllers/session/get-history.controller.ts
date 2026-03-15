import type { FastifyReply, FastifyRequest } from "fastify";

export async function getSessionHistoryHandler(
  request: FastifyRequest<{
    Querystring: { limit?: number; offset?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;
  const limit = request.query.limit ?? 50;
  const offset = request.query.offset ?? 0;

  const sessions = await request.server.useCases.getSessionHistory.execute({
    userId,
    limit,
    offset,
  });

  const body = sessions.map((s) => ({
    ...s,
    startedAt: s.startedAt?.toISOString() ?? null,
    completedAt: s.completedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return reply.status(200).send(body);
}
