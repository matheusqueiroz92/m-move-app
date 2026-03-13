import type { FastifyReply, FastifyRequest } from "fastify";

export async function listPtInvitesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const invites = await request.server.useCases.listPtInvites.execute({
    personalTrainerId: userId,
  });
  const body = invites.map((inv) => ({
    ...inv,
    inviteExpiresAt: inv.inviteExpiresAt.toISOString(),
    acceptedAt: inv.acceptedAt?.toISOString() ?? null,
    revokedAt: inv.revokedAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
  }));

  return reply.status(200).send(body);
}
