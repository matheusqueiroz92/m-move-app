import type {
  AIChatMessageRepository,
  AIChatMessageResult,
  CreateAIChatMessageInput,
} from "../../../../domain/ai/repositories/ai-chat-message.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toAIChatMessageResult } from "../mappers/ai-chat-message.mapper.js";

export class PrismaAIChatMessageRepository implements AIChatMessageRepository {
  async create(input: CreateAIChatMessageInput): Promise<AIChatMessageResult> {
    const row = await prisma.aIChatMessage.create({
      data: {
        chatId: input.chatId,
        role: input.role,
        content: input.content,
      },
    });
    return toAIChatMessageResult(row);
  }

  async findByChatId(chatId: string): Promise<AIChatMessageResult[]> {
    const rows = await prisma.aIChatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toAIChatMessageResult);
  }

  async countUserMessagesByDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    return prisma.aIChatMessage.count({
      where: {
        role: "USER",
        createdAt: { gte: start, lte: end },
        chat: { userId },
      },
    });
  }
}
