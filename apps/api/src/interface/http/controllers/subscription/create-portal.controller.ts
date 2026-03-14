import type { FastifyReply, FastifyRequest } from "fastify";

export async function createPortalHandler(
  request: FastifyRequest<{ Body: { returnUrl: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const result = await request.server.useCases.createPortalSession.execute({
    userId,
    returnUrl: request.body.returnUrl,
  });
  return reply.status(200).send(result);
}
