import { describe, expect, it, vi } from "vitest";

import type { OpenAIChatProvider } from "../../domain/ai/providers/openai-provider.interface.js";
import type { AIChatRepository, AIChatResult } from "../../domain/ai/repositories/ai-chat.repository.js";
import type {
  AIChatMessageRepository,
  AIChatMessageResult,
} from "../../domain/ai/repositories/ai-chat-message.repository.js";
import { SendChatMessageUseCase } from "./send-chat-message.use-case.js";

describe("SendChatMessageUseCase", () => {
  it("should create chat and messages when chatId is new", async () => {
    const chatResult: AIChatResult = {
      id: "chat-1",
      userId: "user-1",
      title: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userMsg: AIChatMessageResult = {
      id: "msg-1",
      chatId: "chat-1",
      role: "USER",
      content: "Olá",
      createdAt: new Date(),
    };
    const assistantMsg: AIChatMessageResult = {
      id: "msg-2",
      chatId: "chat-1",
      role: "ASSISTANT",
      content: "Olá! Como posso ajudar?",
      createdAt: new Date(),
    };

    const chatRepo: AIChatRepository = {
      create: vi.fn().mockResolvedValue(chatResult),
      findById: vi.fn().mockResolvedValue(null),
      findByUserId: vi.fn(),
    };
    const messageRepo: AIChatMessageRepository = {
      create: vi
        .fn()
        .mockResolvedValueOnce(userMsg)
        .mockResolvedValueOnce(assistantMsg),
      findByChatId: vi.fn().mockResolvedValue([userMsg]),
    };
    const chatProvider: OpenAIChatProvider = {
      chat: vi.fn().mockResolvedValue("Olá! Como posso ajudar?"),
    };

    const useCase = new SendChatMessageUseCase(
      chatRepo,
      messageRepo,
      chatProvider,
    );

    const result = await useCase.execute({
      userId: "user-1",
      chatId: null,
      content: "Olá",
    });

    expect(chatRepo.create).toHaveBeenCalledWith({ userId: "user-1", title: null });
    expect(messageRepo.create).toHaveBeenCalledWith({
      chatId: "chat-1",
      role: "USER",
      content: "Olá",
    });
    expect(chatProvider.chat).toHaveBeenCalledWith([
      { role: "user", content: "Olá" },
    ]);
    expect(messageRepo.create).toHaveBeenCalledTimes(2);
    expect(result.chatId).toBe("chat-1");
    expect(result.content).toBe("Olá! Como posso ajudar?");
  });
});
