import type { FastifyReply, FastifyRequest } from "fastify";

export async function listGymMembersHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Querystring: { limit?: number; offset?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;
  const limit = request.query.limit ?? 20;
  const offset = request.query.offset ?? 0;

  const result = await request.server.useCases.listGymMembers.execute({
    gymId: request.params.id,
    userId,
    limit,
    offset,
  });
  const body = {
    items: result.items.map((m) => ({
      ...m,
      inviteExpiresAt: m.inviteExpiresAt.toISOString(),
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      revokedAt: m.revokedAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  };
  return reply.status(200).send(body);
}
