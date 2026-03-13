import { randomUUID } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { SendPtInviteUseCase } from "../../../../application/pt-invite/send-pt-invite.use-case.js";
import { PrismaPtStudentLinkRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-pt-student-link.repository.js";

const repository = new PrismaPtStudentLinkRepository();
const useCase = new SendPtInviteUseCase(repository);

const INVITE_EXPIRES_DAYS = 7;

export async function sendPtInviteHandler(
  request: FastifyRequest<{ Body: { inviteEmail: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRES_DAYS);

  const link = await useCase.execute({
    personalTrainerId: userId,
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
}
