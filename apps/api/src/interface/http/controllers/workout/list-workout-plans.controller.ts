import type { FastifyReply, FastifyRequest } from "fastify";

export async function listWorkoutPlansHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

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
