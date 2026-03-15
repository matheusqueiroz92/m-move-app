import type { FastifyReply, FastifyRequest } from "fastify";

export async function revokeGymStudentHandler(
  request: FastifyRequest<{ Params: { linkId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  await request.server.useCases.revokeGymStudent.execute({
    linkId: request.params.linkId,
    userId,
  });

  return reply.status(204).send();
}
