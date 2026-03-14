import type { AIChatRole } from "./ai-chat.repository.js";

export interface CreateAIChatMessageInput {
  chatId: string;
  role: AIChatRole;
  content: string;
}

export interface AIChatMessageResult {
  id: string;
  chatId: string;
  role: string;
  content: string;
  createdAt: Date;
}

export interface AIChatMessageRepository {
  create(input: CreateAIChatMessageInput): Promise<AIChatMessageResult>;
  findByChatId(chatId: string): Promise<AIChatMessageResult[]>;
  countUserMessagesByDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number>;
}
