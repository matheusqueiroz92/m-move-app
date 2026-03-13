import type { FastifyReply, FastifyRequest } from "fastify";

export async function getGymByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const gym = await request.server.useCases.getGymById.execute({
    id: request.params.id,
  });
  return reply.status(200).send({
    ...gym,
    createdAt: gym.createdAt.toISOString(),
    updatedAt: gym.updatedAt.toISOString(),
  });
}
