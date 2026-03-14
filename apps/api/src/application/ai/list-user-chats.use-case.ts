import type {
  AIChatRepository,
  AIChatResult,
} from "../../domain/ai/repositories/ai-chat.repository.js";

export interface ListUserChatsInput {
  userId: string;
  limit: number;
  offset: number;
}

export interface ListUserChatsResult {
  items: AIChatResult[];
  total: number;
  limit: number;
  offset: number;
}

export class ListUserChatsUseCase {
  constructor(private readonly chatRepository: AIChatRepository) {}

  async execute(input: ListUserChatsInput): Promise<ListUserChatsResult> {
    const { items, total } =
      await this.chatRepository.findByUserIdPaginated(input.userId, {
        limit: input.limit,
        offset: input.offset,
      });
    return {
      items,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }
}
