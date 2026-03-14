import type { FastifyReply, FastifyRequest } from "fastify";

export async function listWorkoutPlansHandler(
  request: FastifyRequest<{ Querystring: { limit?: number; offset?: number } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;
  const limit = request.query.limit ?? 20;
  const offset = request.query.offset ?? 0;

  const result = await request.server.useCases.listWorkoutPlans.execute({
    userId,
    limit,
    offset,
  });
  const body = {
    items: result.items.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  };
  return reply.status(200).send(body);
}
