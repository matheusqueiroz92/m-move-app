import type { FastifyReply, FastifyRequest } from "fastify";

export async function listChatsHandler(
  request: FastifyRequest<{
    Querystring: { limit?: number; offset?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;
  const limit = request.query.limit ?? 20;
  const offset = request.query.offset ?? 0;

  const result = await request.server.useCases.listUserChats.execute({
    userId,
    limit,
    offset,
  });
  return reply.status(200).send({
    items: result.items.map((c) => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  });
}
