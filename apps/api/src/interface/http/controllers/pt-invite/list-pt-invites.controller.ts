import type { FastifyReply, FastifyRequest } from "fastify";

import { ListPtInvitesUseCase } from "../../../../application/pt-invite/list-pt-invites.use-case.js";
import { PrismaPtStudentLinkRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-pt-student-link.repository.js";

const repository = new PrismaPtStudentLinkRepository();
const useCase = new ListPtInvitesUseCase(repository);

export async function listPtInvitesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const invites = await useCase.execute({ personalTrainerId: userId });
  const body = invites.map((inv) => ({
    ...inv,
    inviteExpiresAt: inv.inviteExpiresAt.toISOString(),
    acceptedAt: inv.acceptedAt?.toISOString() ?? null,
    revokedAt: inv.revokedAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
  }));

  return reply.status(200).send(body);
}
