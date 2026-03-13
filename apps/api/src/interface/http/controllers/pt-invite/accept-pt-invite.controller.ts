import type { FastifyReply, FastifyRequest } from "fastify";

import { AcceptPtInviteUseCase } from "../../../../application/pt-invite/accept-pt-invite.use-case.js";
import { PrismaPtStudentLinkRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-pt-student-link.repository.js";

const repository = new PrismaPtStudentLinkRepository();
const useCase = new AcceptPtInviteUseCase(repository);

export async function acceptPtInviteHandler(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const link = await useCase.execute({
    token: request.body.token,
    studentId: userId,
  });
  return reply.status(200).send({
    ...link,
    inviteExpiresAt: link.inviteExpiresAt.toISOString(),
    acceptedAt: link.acceptedAt?.toISOString() ?? null,
    revokedAt: link.revokedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
  });
}
