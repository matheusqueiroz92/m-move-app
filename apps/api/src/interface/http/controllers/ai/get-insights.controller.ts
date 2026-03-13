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
  try {
    const insights = await request.server.useCases.getUserInsights.execute({
      userId,
    });
    return reply.status(200).send({ insights });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get insights";
    if (message.includes("OPENAI_API_KEY")) {
      return reply.status(503).send({ message });
    }
    return reply.status(500).send({ message });
  }
}
