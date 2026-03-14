import type { AIChatMessageRepository } from "../../domain/ai/repositories/ai-chat-message.repository.js";
import type { UseCases } from "../../composition-root.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }

  interface FastifyInstance {
    useCases: UseCases;
    userRepository: UserRepository;
    aiChatMessageRepository: AIChatMessageRepository;
  }
}
