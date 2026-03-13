import type { FastifyReply, FastifyRequest } from "fastify";

import { RemoveInstructorUseCase } from "../../../../application/gym/remove-instructor.use-case.js";
import { InstructorLinkNotFoundError } from "../../../../domain/gym/errors/instructor-link-not-found.error.js";
import { PrismaGymInstructorRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym-instructor.repository.js";
import { PrismaGymRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym.repository.js";

const gymRepository = new PrismaGymRepository();
const instructorRepository = new PrismaGymInstructorRepository();
const useCase = new RemoveInstructorUseCase(gymRepository, instructorRepository);

export async function removeInstructorHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    await useCase.execute({
      linkId: request.params.id,
      ownerId: userId,
    });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof InstructorLinkNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
