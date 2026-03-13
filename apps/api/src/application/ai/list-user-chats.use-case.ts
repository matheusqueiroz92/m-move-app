import type { AIChatRepository, AIChatResult } from "../../domain/ai/repositories/ai-chat.repository.js";

export class ListUserChatsUseCase {
  constructor(private readonly chatRepository: AIChatRepository) {}

  async execute(input: { userId: string }): Promise<AIChatResult[]> {
    return this.chatRepository.findByUserId(input.userId);
  }
}
