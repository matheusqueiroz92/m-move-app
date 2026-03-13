import type { FastifyReply, FastifyRequest } from "fastify";

export async function createWorkoutDayHandler(
  request: FastifyRequest<{
    Params: { planId: string };
    Body: {
      name: string;
      isRest?: boolean;
      weekDay: string;
      estimatedDurationInSeconds?: number | null;
      coverImageUrl?: string | null;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const body = request.body;
  const day = await request.server.useCases.createWorkoutDay.execute({
      planId: request.params.planId,
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
        | "SUNDAY",
      estimatedDurationInSeconds: body.estimatedDurationInSeconds,
      coverImageUrl: body.coverImageUrl,
  });
  return reply.status(201).send({
    ...day,
    createdAt: day.createdAt.toISOString(),
    updatedAt: day.updatedAt.toISOString(),
  });
}
