import type { FastifyReply, FastifyRequest } from "fastify";

export async function acceptPtInviteHandler(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const link = await request.server.useCases.acceptPtInvite.execute({
    token: request.body.token,
    studentId: userId,
  });
  return reply.status(200).send({
    ...link,
    inviteExpiresAt: link.inviteExpiresAt.toISOString(),
    acceptedAt: link.acceptedAt?.toISOString() ?? null,
    revokedAt: link.revokedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
  });
}
