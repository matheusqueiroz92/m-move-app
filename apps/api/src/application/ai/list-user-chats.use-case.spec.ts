import { describe, expect, it, vi } from "vitest";

import type { AIChatRepository, AIChatResult } from "../../domain/ai/repositories/ai-chat.repository.js";
import { ListUserChatsUseCase } from "./list-user-chats.use-case.js";

describe("ListUserChatsUseCase", () => {
  it("should return user chats ordered by updatedAt desc", async () => {
    const chats: AIChatResult[] = [
      {
        id: "chat-1",
        userId: "user-1",
        title: "Treino A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const findByUserIdPaginated = vi.fn().mockResolvedValue({
      items: chats,
      total: chats.length,
    });
    const repo: AIChatRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated,
    };
    const useCase = new ListUserChatsUseCase(repo);
    const result = await useCase.execute({
      userId: "user-1",
      limit: 20,
      offset: 0,
    });
    expect(findByUserIdPaginated).toHaveBeenCalledWith("user-1", {
      limit: 20,
      offset: 0,
    });
    expect(result.items).toEqual(chats);
  });
});
