import type { FastifyReply, FastifyRequest } from "fastify";

const ACTIVE_SUBSCRIPTION_STATUSES = ["ACTIVE", "TRIALING"] as const;
const ROLES_WITHOUT_OWN_PLAN = ["LINKED_STUDENT", "INSTRUCTOR"] as const;

/**
 * Middleware RF-004: Garante que o usuário tenha plano ativo (subscriptionStatus ACTIVE ou TRIALING)
 * ou seja LINKED_STUDENT/INSTRUCTOR (acessam via plano do PT/academia).
 * Retorna 403 quando o usuário não tem assinatura ativa.
 */
export async function requireActivePlan(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const user = await request.server.userRepository.findByIdWithSubscription(
    userId,
  );
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  if (ROLES_WITHOUT_OWN_PLAN.includes(user.role as (typeof ROLES_WITHOUT_OWN_PLAN)[number])) {
    return;
  }

  if (
    user.subscriptionStatus &&
    ACTIVE_SUBSCRIPTION_STATUSES.includes(
      user.subscriptionStatus as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number],
    )
  ) {
    return;
  }

  return reply.status(403).send({
    message: "Active subscription required",
    code: "SUBSCRIPTION_REQUIRED",
  });
}
