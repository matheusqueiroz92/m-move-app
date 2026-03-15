import { randomUUID } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

const INVITE_EXPIRES_DAYS = 7;

export async function sendGymInviteHandler(
  request: FastifyRequest<{
    Body: { gymId: string; inviteEmail: string; instructorId?: string | null };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRES_DAYS);

  const link = await request.server.useCases.sendGymInvite.execute({
    gymId: request.body.gymId,
    inviteEmail: request.body.inviteEmail,
    instructorId: request.body.instructorId ?? undefined,
    inviteToken: randomUUID(),
    inviteExpiresAt: expiresAt,
    userId,
  });

  return reply.status(201).send({
    ...link,
    inviteExpiresAt: link.inviteExpiresAt.toISOString(),
    acceptedAt: link.acceptedAt?.toISOString() ?? null,
    revokedAt: link.revokedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
  });
}
