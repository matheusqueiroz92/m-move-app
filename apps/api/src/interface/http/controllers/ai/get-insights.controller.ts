import type { FastifyReply, FastifyRequest } from "fastify";

export async function getInsightsHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const currentUserId = request.userId!;

  const { userId } = request.params;
  if (userId !== currentUserId) {
    return reply.status(403).send({ message: "Forbidden" });
  }
  const insights = await request.server.useCases.getUserInsights.execute({
    userId,
  });
  return reply.status(200).send({ insights });
}
