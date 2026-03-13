import type { FastifyReply, FastifyRequest } from "fastify";

export async function updateWorkoutDayHandler(
  request: FastifyRequest<{
    Params: { planId: string; dayId: string };
    Body: {
      name?: string;
      isRest?: boolean;
      weekDay?: string;
      estimatedDurationInSeconds?: number | null;
      coverImageUrl?: string | null;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const body = request.body;
  const day = await request.server.useCases.updateWorkoutDay.execute({
      planId: request.params.planId,
      dayId: request.params.dayId,
      userId,
      name: body.name,
      isRest: body.isRest,
      weekDay: body.weekDay as
        | "MONDAY"
        | "TUESDAY"
        | "WEDNESDAY"
        | "THURSDAY"
        | "FRIDAY"
        | "SATURDAY"
        | "SUNDAY"
        | undefined,
      estimatedDurationInSeconds: body.estimatedDurationInSeconds,
      coverImageUrl: body.coverImageUrl,
  });
  return reply.status(200).send({
    ...day,
    createdAt: day.createdAt.toISOString(),
    updatedAt: day.updatedAt.toISOString(),
  });
}
