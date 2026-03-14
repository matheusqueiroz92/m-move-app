import type { FastifyReply, FastifyRequest } from "fastify";

export async function updateWorkoutPlanHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { name?: string; description?: string | null };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const plan = await request.server.useCases.updateWorkoutPlan.execute({
    planId: request.params.id,
    userId,
    name: request.body.name,
    description: request.body.description,
  });
  return reply.status(200).send({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  });
}
