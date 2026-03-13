import type { FastifyReply, FastifyRequest } from "fastify";

export async function getSubscriptionStatusHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const subscription = await request.server.useCases.getSubscriptionStatus.execute({
    userId,
  });
  if (!subscription) {
    return reply.status(200).send(null);
  }
  return reply.status(200).send({
    ...subscription,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
    trialEnd: subscription.trialEnd?.toISOString() ?? null,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  });
}
