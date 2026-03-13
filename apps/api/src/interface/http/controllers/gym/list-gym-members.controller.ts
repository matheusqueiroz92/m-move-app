import type { FastifyReply, FastifyRequest } from "fastify";

import { ListGymMembersUseCase } from "../../../../application/gym/list-gym-members.use-case.js";
import { GymNotFoundError } from "../../../../domain/gym/errors/gym-not-found.error.js";
import { PrismaGymInstructorRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym-instructor.repository.js";
import { PrismaGymRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym.repository.js";

const gymRepository = new PrismaGymRepository();
const instructorRepository = new PrismaGymInstructorRepository();
const useCase = new ListGymMembersUseCase(gymRepository, instructorRepository);

export async function listGymMembersHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const members = await useCase.execute({
      gymId: request.params.id,
      userId,
    });
    const body = members.map((m) => ({
      ...m,
      inviteExpiresAt: m.inviteExpiresAt.toISOString(),
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      revokedAt: m.revokedAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    }));
    return reply.status(200).send(body);
  } catch (error) {
    if (error instanceof GymNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
