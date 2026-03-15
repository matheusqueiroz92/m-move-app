import type { AIChatMessageRepository } from "../../domain/ai/repositories/ai-chat-message.repository.js";
import type { UseCases } from "../../composition-root.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymStudentLinkRepository } from "../../domain/gym/repositories/gym-student-link.repository.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }

  interface FastifyInstance {
    useCases: UseCases;
    userRepository: UserRepository;
    aiChatMessageRepository: AIChatMessageRepository;
    gymRepository: GymRepository;
    gymInstructorRepository: GymInstructorRepository;
    gymStudentLinkRepository: GymStudentLinkRepository;
  }
}
