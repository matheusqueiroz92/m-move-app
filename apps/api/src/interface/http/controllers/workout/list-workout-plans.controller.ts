import type { FastifyReply, FastifyRequest } from "fastify";

export async function listWorkoutPlansHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const plans = await request.server.useCases.listWorkoutPlans.execute({
    userId,
  });
  const body = plans.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
