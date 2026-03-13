import type { FastifyReply, FastifyRequest } from "fastify";

export async function activateWorkoutPlanHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const plan = await request.server.useCases.activateWorkoutPlan.execute({
    planId: request.params.id,
    userId,
  });
  return reply.status(200).send({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  });
}
