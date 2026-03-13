import type { FastifyReply, FastifyRequest } from "fastify";

import { HandleStripeWebhookUseCase } from "../../../../application/subscription/handle-stripe-webhook.use-case.js";
import { PrismaSubscriptionRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-subscription.repository.js";
import { PrismaUserRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-user.repository.js";
import { StripeProviderImpl } from "../../../../infrastructure/providers/stripe-provider.js";
import { env } from "../../../../lib/env.js";

const stripeProvider = new StripeProviderImpl();
const subscriptionRepository = new PrismaSubscriptionRepository();
const userRepository = new PrismaUserRepository();
const useCase = new HandleStripeWebhookUseCase(
  stripeProvider,
  subscriptionRepository,
  userRepository,
);

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

  try {
    await useCase.execute({ payload, signature, secret });
    return reply.status(200).send({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed";

    if (message === "Invalid signature") {
      return reply.status(400).send({ message });
    }

    return reply.status(500).send({ message });
  }
}
