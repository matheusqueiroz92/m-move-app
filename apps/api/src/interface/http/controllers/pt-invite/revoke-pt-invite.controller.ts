import type { FastifyReply, FastifyRequest } from "fastify";

export async function revokePtInviteHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  await request.server.useCases.revokePtInvite.execute({
    inviteId: request.params.id,
    personalTrainerId: userId,
  });
  return reply.status(204).send();
}
