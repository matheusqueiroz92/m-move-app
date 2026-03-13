import type { AIChatResult } from "../../../../domain/ai/repositories/ai-chat.repository.js";
import type { AIChat } from "../../../../generated/prisma/client.js";

export function toAIChatResult(row: AIChat): AIChatResult {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
