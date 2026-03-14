import type { FastifyReply, FastifyRequest } from "fastify";

export async function deleteWorkoutPlanHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  await request.server.useCases.deleteWorkoutPlan.execute({
    planId: request.params.id,
    userId,
  });
  return reply.status(204).send();
}
