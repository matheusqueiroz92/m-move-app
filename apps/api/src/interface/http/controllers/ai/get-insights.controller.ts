import type { FastifyReply, FastifyRequest } from "fastify";

import { GetUserInsightsUseCase } from "../../../../application/ai/get-user-insights.use-case.js";
import { OpenAIPlanProviderImpl } from "../../../../infrastructure/providers/openai-provider.js";

const provider = new OpenAIPlanProviderImpl();
const useCase = new GetUserInsightsUseCase(provider);

export async function getInsightsHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const currentUserId = request.userId;
  if (!currentUserId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
  const { userId } = request.params;
  if (userId !== currentUserId) {
    return reply.status(403).send({ message: "Forbidden" });
  }
  try {
    const insights = await useCase.execute({ userId });
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
