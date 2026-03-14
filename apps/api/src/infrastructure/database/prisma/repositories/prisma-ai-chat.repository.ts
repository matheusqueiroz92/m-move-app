import type {
  AIChatRepository,
  AIChatResult,
  CreateAIChatInput,
} from "../../../../domain/ai/repositories/ai-chat.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toAIChatResult } from "../mappers/ai-chat.mapper.js";

export class PrismaAIChatRepository implements AIChatRepository {
  async create(input: CreateAIChatInput): Promise<AIChatResult> {
    const row = await prisma.aIChat.create({
      data: {
        userId: input.userId,
        title: input.title ?? undefined,
      },
    });
    return toAIChatResult(row);
  }

  async findById(id: string): Promise<AIChatResult | null> {
    const row = await prisma.aIChat.findUnique({ where: { id } });
    return row ? toAIChatResult(row) : null;
  }

  async findByUserId(userId: string): Promise<AIChatResult[]> {
    const rows = await prisma.aIChat.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(toAIChatResult);
  }

  async findByUserIdPaginated(
    userId: string,
    options: { limit: number; offset: number },
  ) {
    const [items, total] = await Promise.all([
      prisma.aIChat.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: options.limit,
        skip: options.offset,
      }),
      prisma.aIChat.count({ where: { userId } }),
    ]);
    return {
      items: items.map(toAIChatResult),
      total,
    };
  }
}
