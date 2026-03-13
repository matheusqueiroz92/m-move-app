import type { FastifyReply, FastifyRequest } from "fastify";

export async function completeSessionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const session = await request.server.useCases.completeWorkoutSession.execute({
    sessionId: request.params.id,
    userId,
  });
  return reply.status(200).send({
    ...session,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  });
}
