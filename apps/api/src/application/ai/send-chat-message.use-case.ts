import { ChatNotFoundError } from "../../domain/ai/errors/chat-not-found.error.js";
import type { OpenAIChatProvider } from "../../domain/ai/providers/openai-provider.interface.js";
import type { AIChatRepository } from "../../domain/ai/repositories/ai-chat.repository.js";
import type { AIChatMessageRepository } from "../../domain/ai/repositories/ai-chat-message.repository.js";

export interface SendChatMessageInput {
  userId: string;
  chatId: string | null;
  content: string;
}

export interface SendChatMessageResult {
  chatId: string;
  content: string;
}

export class SendChatMessageUseCase {
  constructor(
    private readonly chatRepository: AIChatRepository,
    private readonly messageRepository: AIChatMessageRepository,
    private readonly chatProvider: OpenAIChatProvider,
  ) {}

  async execute(input: SendChatMessageInput): Promise<SendChatMessageResult> {
    let chatId = input.chatId;
    if (!chatId) {
      const chat = await this.chatRepository.create({
        userId: input.userId,
        title: null,
      });
      chatId = chat.id;
    } else {
      const chat = await this.chatRepository.findById(chatId);
      if (!chat || chat.userId !== input.userId) {
        throw new ChatNotFoundError(chatId);
      }
    }

    await this.messageRepository.create({
      chatId,
      role: "USER",
      content: input.content,
    });

    const history = await this.messageRepository.findByChatId(chatId);
    const messages = history.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant" | "system",
      content: m.content,
    }));

    const assistantContent = await this.chatProvider.chat(messages);

    await this.messageRepository.create({
      chatId,
      role: "ASSISTANT",
      content: assistantContent,
    });

    return { chatId, content: assistantContent };
  }
}
