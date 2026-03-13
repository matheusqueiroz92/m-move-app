import type { FastifyReply, FastifyRequest } from "fastify";

export async function getGymByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const gym = await request.server.useCases.getGymById.execute({
    id: request.params.id,
  });
  return reply.status(200).send({
    ...gym,
    createdAt: gym.createdAt.toISOString(),
    updatedAt: gym.updatedAt.toISOString(),
  });
}
