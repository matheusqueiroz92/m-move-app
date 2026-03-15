import type { FastifyReply, FastifyRequest } from "fastify";

export async function listGymStudentsHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Querystring: { limit?: number; offset?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;
  const limit = request.query.limit ?? 20;
  const offset = request.query.offset ?? 0;

  const result = await request.server.useCases.listGymStudents.execute({
    gymId: request.params.id,
    userId,
    limit,
    offset,
  });

  const body = {
    items: result.items.map((item) => ({
      ...item,
      inviteExpiresAt: item.inviteExpiresAt.toISOString(),
      acceptedAt: item.acceptedAt?.toISOString() ?? null,
      revokedAt: item.revokedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      studentName: item.studentName ?? null,
      studentEmail: item.studentEmail ?? null,
    })),
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  };
  return reply.status(200).send(body);
}
