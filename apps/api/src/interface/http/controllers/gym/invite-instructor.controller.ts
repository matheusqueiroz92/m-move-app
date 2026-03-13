import { randomUUID } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { InviteInstructorUseCase } from "../../../../application/gym/invite-instructor.use-case.js";
import { GymNotFoundError } from "../../../../domain/gym/errors/gym-not-found.error.js";
import { InstructorLimitReachedError } from "../../../../domain/gym/errors/instructor-limit-reached.error.js";
import { PrismaGymInstructorRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym-instructor.repository.js";
import { PrismaGymRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym.repository.js";

const gymRepository = new PrismaGymRepository();
const instructorRepository = new PrismaGymInstructorRepository();
const useCase = new InviteInstructorUseCase(gymRepository, instructorRepository);

const INVITE_EXPIRES_DAYS = 7;

export async function inviteInstructorHandler(
  request: FastifyRequest<{
    Body: { gymId: string; inviteEmail: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRES_DAYS);

    const link = await useCase.execute({
      gymId: request.body.gymId,
      ownerId: userId,
      inviteEmail: request.body.inviteEmail,
      inviteToken: randomUUID(),
      inviteExpiresAt: expiresAt,
    });

    return reply.status(201).send({
      ...link,
      inviteExpiresAt: link.inviteExpiresAt.toISOString(),
      acceptedAt: link.acceptedAt?.toISOString() ?? null,
      revokedAt: link.revokedAt?.toISOString() ?? null,
      createdAt: link.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof GymNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof InstructorLimitReachedError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}
