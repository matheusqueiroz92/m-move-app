import type { FastifyReply, FastifyRequest } from "fastify";

import { CreateGymUseCase } from "../../../../application/gym/create-gym.use-case.js";
import { PrismaGymRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym.repository.js";

const repository = new PrismaGymRepository();
const useCase = new CreateGymUseCase(repository);

export async function createGymHandler(
  request: FastifyRequest<{
    Body: { name: string; maxInstructors?: number; maxStudents?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const body = request.body;
  const gym = await useCase.execute({
    name: body.name,
    ownerId: userId,
    maxInstructors: body.maxInstructors,
    maxStudents: body.maxStudents,
  });

  return reply.status(201).send({
    ...gym,
    createdAt: gym.createdAt.toISOString(),
    updatedAt: gym.updatedAt.toISOString(),
  });
}
