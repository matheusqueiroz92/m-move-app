import type { FastifyReply, FastifyRequest } from "fastify";

export async function deleteWorkoutDayHandler(
  request: FastifyRequest<{ Params: { planId: string; dayId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  await request.server.useCases.deleteWorkoutDay.execute({
    planId: request.params.planId,
    dayId: request.params.dayId,
    userId,
  });
  return reply.status(204).send();
}
