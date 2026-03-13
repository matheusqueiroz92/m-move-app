import type { AIChatMessageResult } from "../../../../domain/ai/repositories/ai-chat-message.repository.js";
import type { AIChatMessage } from "../../../../generated/prisma/client.js";

export function toAIChatMessageResult(row: AIChatMessage): AIChatMessageResult {
  return {
    id: row.id,
    chatId: row.chatId,
    role: row.role,
    content: row.content,
    createdAt: row.createdAt,
  };
}
