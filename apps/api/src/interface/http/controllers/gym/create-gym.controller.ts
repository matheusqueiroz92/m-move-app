import type { FastifyReply, FastifyRequest } from "fastify";

export async function createGymHandler(
  request: FastifyRequest<{
    Body: { name: string; maxInstructors?: number; maxStudents?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const body = request.body;
  const gym = await request.server.useCases.createGym.execute({
    name: body.name,
    ownerId: userId,
    maxInstructors: body.maxInstructors,
    maxStudents: body.maxStudents,
  });

  return reply.status(201).send({
    ...gym,
    createdAt: gym.createdAt.toISOString(),
    updatedAt: gym.updatedAt.toISOString(),
  });
}
