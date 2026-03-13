import type { FastifyReply, FastifyRequest } from "fastify";

import { CreatePortalSessionUseCase } from "../../../../application/subscription/create-portal-session.use-case.js";
import { PrismaUserRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-user.repository.js";
import { StripeProviderImpl } from "../../../../infrastructure/providers/stripe-provider.js";

const userRepository = new PrismaUserRepository();
const stripeProvider = new StripeProviderImpl();
const useCase = new CreatePortalSessionUseCase(userRepository, stripeProvider);

export async function createPortalHandler(
  request: FastifyRequest<{ Body: { returnUrl: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const result = await useCase.execute({
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
