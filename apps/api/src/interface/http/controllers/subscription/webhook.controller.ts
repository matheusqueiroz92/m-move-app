import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../../../lib/env.js";

export async function stripeWebhookHandler(
  request: FastifyRequest<{ Body: Buffer | string }>,
  reply: FastifyReply,
): Promise<void> {
  const raw = request.body;
  const payload = typeof raw === "string" ? Buffer.from(raw, "utf-8") : raw;
  const signature = request.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return reply
      .status(400)
      .send({ message: "Missing stripe-signature header" });
  }
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return reply.status(500).send({ message: "Webhook secret not configured" });
  }

  await request.server.useCases.handleStripeWebhook.execute({
    payload,
    signature,
    secret,
  });
  return reply.status(200).send({ received: true });
}
