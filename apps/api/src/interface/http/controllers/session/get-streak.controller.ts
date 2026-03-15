import type { FastifyReply, FastifyRequest } from "fastify";

const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/** RF-016: When timezone is not in query, use the authenticated user's timezone from DB */
export async function getStreakHandler(
  request: FastifyRequest<{
    Querystring: { timezone?: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  let timezone = request.query.timezone;
  if (timezone == null || timezone === "") {
    const userPlan =
      await request.server.userRepository.findByIdWithPlanAndTimezone(userId);
    timezone = userPlan?.timezone ?? DEFAULT_TIMEZONE;
  }

  const result = await request.server.useCases.getStreak.execute({
    userId,
    timezone,
  });

  return reply.status(200).send(result);
}
