import type { FastifyReply, FastifyRequest } from "fastify";

export async function removeInstructorHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  await request.server.useCases.removeInstructor.execute({
    linkId: request.params.id,
    ownerId: userId,
  });
  return reply.status(204).send();
}
