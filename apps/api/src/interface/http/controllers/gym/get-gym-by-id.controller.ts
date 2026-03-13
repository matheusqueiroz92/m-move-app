import type { FastifyReply, FastifyRequest } from "fastify";

import { GetGymByIdUseCase } from "../../../../application/gym/get-gym-by-id.use-case.js";
import { GymNotFoundError } from "../../../../domain/gym/errors/gym-not-found.error.js";
import { PrismaGymRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-gym.repository.js";

const repository = new PrismaGymRepository();
const useCase = new GetGymByIdUseCase(repository);

export async function getGymByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const gym = await useCase.execute({ id: request.params.id });
    return reply.status(200).send({
      ...gym,
      createdAt: gym.createdAt.toISOString(),
      updatedAt: gym.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof GymNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
