import type { FastifyReply, FastifyRequest } from "fastify";

export async function listPtInvitesHandler(
  request: FastifyRequest<{
    Querystring: { limit?: number; offset?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;
  const limit = request.query.limit ?? 20;
  const offset = request.query.offset ?? 0;

  const result = await request.server.useCases.listPtInvites.execute({
    personalTrainerId: userId,
    limit,
    offset,
  });
  const body = {
    items: result.items.map((inv) => ({
      ...inv,
      inviteExpiresAt: inv.inviteExpiresAt.toISOString(),
      acceptedAt: inv.acceptedAt?.toISOString() ?? null,
      revokedAt: inv.revokedAt?.toISOString() ?? null,
      createdAt: inv.createdAt.toISOString(),
    })),
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  };

  return reply.status(200).send(body);
}
