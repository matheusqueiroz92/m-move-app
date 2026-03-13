import type { FastifyReply, FastifyRequest } from "fastify";

import { RevokePtInviteUseCase } from "../../../../application/pt-invite/revoke-pt-invite.use-case.js";
import { PtInviteNotFoundError } from "../../../../domain/pt-invite/errors/pt-invite-not-found.error.js";
import { PrismaPtStudentLinkRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-pt-student-link.repository.js";

const repository = new PrismaPtStudentLinkRepository();
const useCase = new RevokePtInviteUseCase(repository);

export async function revokePtInviteHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    await useCase.execute({
      inviteId: request.params.id,
      personalTrainerId: userId,
    });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof PtInviteNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
