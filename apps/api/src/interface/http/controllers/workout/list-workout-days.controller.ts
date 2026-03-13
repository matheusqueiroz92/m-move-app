import type { FastifyReply, FastifyRequest } from "fastify";

export async function listWorkoutDaysHandler(
  request: FastifyRequest<{ Params: { planId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const days = await request.server.useCases.listWorkoutDays.execute({
    planId: request.params.planId,
    userId,
  });
  const body = days.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
