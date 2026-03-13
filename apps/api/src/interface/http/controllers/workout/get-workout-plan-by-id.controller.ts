import type { FastifyReply, FastifyRequest } from "fastify";

export async function getWorkoutPlanByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const plan = await request.server.useCases.getWorkoutPlanById.execute({
    planId: request.params.id,
    userId,
  });
  return reply.status(200).send({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  });
}
