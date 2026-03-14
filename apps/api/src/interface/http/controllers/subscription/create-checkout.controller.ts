import type { FastifyReply, FastifyRequest } from "fastify";

export async function createCheckoutHandler(
  request: FastifyRequest<{
    Body: { priceId: string; successUrl: string; cancelUrl: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const result = await request.server.useCases.createCheckoutSession.execute({
    priceId: request.body.priceId,
    userId,
    successUrl: request.body.successUrl,
    cancelUrl: request.body.cancelUrl,
  });
  return reply.status(200).send(result);
}
