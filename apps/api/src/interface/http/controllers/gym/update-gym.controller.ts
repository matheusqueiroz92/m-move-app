import type { FastifyReply, FastifyRequest } from "fastify";

export async function updateGymHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Body: {
      name?: string;
      maxInstructors?: number;
      maxStudents?: number;
      isActive?: boolean;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const gym = await request.server.useCases.updateGym.execute({
    gymId: request.params.id,
    ownerId: userId,
    input: request.body,
  });
  return reply.status(200).send({
    ...gym,
    createdAt: gym.createdAt.toISOString(),
    updatedAt: gym.updatedAt.toISOString(),
  });
}
