import type { FastifyRequest, FastifyReply } from "fastify";

import { GetUserProfileUseCase } from "../../../../application/user/get-user-profile.use-case.js";
import { UserNotFoundError } from "../../../../domain/user/errors/user-not-found.error.js";
import { PrismaUserRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-user.repository.js";

const userRepository = new PrismaUserRepository();
const getProfileUseCase = new GetUserProfileUseCase(userRepository);

export async function getProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const profile = await getProfileUseCase.execute({ userId });
    return reply.status(200).send(profile);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
