import type { FastifyReply, FastifyRequest } from "fastify";

export async function listGymMembersHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const members = await request.server.useCases.listGymMembers.execute({
    gymId: request.params.id,
    userId,
  });
  const body = members.map((m) => ({
    ...m,
    inviteExpiresAt: m.inviteExpiresAt.toISOString(),
    acceptedAt: m.acceptedAt?.toISOString() ?? null,
    revokedAt: m.revokedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
