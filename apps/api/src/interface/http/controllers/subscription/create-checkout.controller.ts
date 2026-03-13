import type { FastifyReply, FastifyRequest } from "fastify";

import { CreateCheckoutSessionUseCase } from "../../../../application/subscription/create-checkout-session.use-case.js";
import { StripeProviderImpl } from "../../../../infrastructure/providers/stripe-provider.js";

const stripeProvider = new StripeProviderImpl();
const useCase = new CreateCheckoutSessionUseCase(stripeProvider);

export async function createCheckoutHandler(
  request: FastifyRequest<{
    Body: { priceId: string; successUrl: string; cancelUrl: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const result = await useCase.execute({
      priceId: request.body.priceId,
      userId,
      successUrl: request.body.successUrl,
      cancelUrl: request.body.cancelUrl,
    });
    return reply.status(200).send(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout session failed";
    return reply.status(500).send({ message });
  }
}
