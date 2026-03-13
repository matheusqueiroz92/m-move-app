import { randomUUID } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

const INVITE_EXPIRES_DAYS = 7;

export async function inviteInstructorHandler(
  request: FastifyRequest<{
    Body: { gymId: string; inviteEmail: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRES_DAYS);

  const link = await request.server.useCases.inviteInstructor.execute({
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
}
