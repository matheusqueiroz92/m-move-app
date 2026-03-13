import type { FastifyReply, FastifyRequest } from "fastify";

import { SendChatMessageUseCase } from "../../../../application/ai/send-chat-message.use-case.js";
import { PrismaAIChatMessageRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-ai-chat-message.repository.js";
import { PrismaAIChatRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-ai-chat.repository.js";
import { OpenAIPlanProviderImpl } from "../../../../infrastructure/providers/openai-provider.js";

const chatRepository = new PrismaAIChatRepository();
const messageRepository = new PrismaAIChatMessageRepository();
const chatProvider = new OpenAIPlanProviderImpl();
const useCase = new SendChatMessageUseCase(
  chatRepository,
  messageRepository,
  chatProvider,
);

export async function sendChatMessageHandler(
  request: FastifyRequest<{
    Body: { chatId?: string | null; content: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
  try {
    const result = await useCase.execute({
      userId,
      chatId: request.body.chatId ?? null,
      content: request.body.content,
    });
    return reply.status(200).send(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat failed";
    if (message.includes("OPENAI_API_KEY")) {
      return reply.status(503).send({ message });
    }
    return reply.status(500).send({ message });
  }
}
