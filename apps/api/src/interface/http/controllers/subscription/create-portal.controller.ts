import type { FastifyReply, FastifyRequest } from "fastify";

export async function createPortalHandler(
  request: FastifyRequest<{ Body: { returnUrl: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const result = await request.server.useCases.createPortalSession.execute({
      userId,
      returnUrl: request.body.returnUrl,
    });
    return reply.status(200).send(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Portal session failed";
    if (message.includes("no Stripe customer")) {
      return reply.status(400).send({ message });
    }
    return reply.status(500).send({ message });
  }
}
