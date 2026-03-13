import type { FastifyReply, FastifyRequest } from "fastify";

export async function createWorkoutPlanHandler(
  request: FastifyRequest<{
    Body: { name: string; description?: string | null };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const body = request.body;
  const plan = await request.server.useCases.createWorkoutPlan.execute({
    userId,
    name: body.name,
    description: body.description,
    createdBy: userId,
  });

  return reply.status(201).send({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  });
}
