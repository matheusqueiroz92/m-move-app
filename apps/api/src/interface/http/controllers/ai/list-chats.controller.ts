import type { FastifyReply, FastifyRequest } from "fastify";

import { ListUserChatsUseCase } from "../../../../application/ai/list-user-chats.use-case.js";
import { PrismaAIChatRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-ai-chat.repository.js";

const chatRepository = new PrismaAIChatRepository();
const useCase = new ListUserChatsUseCase(chatRepository);

export async function listChatsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
  const chats = await useCase.execute({ userId });
  return reply.status(200).send(
    chats.map((c) => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  );
}
