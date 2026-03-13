import type { FastifyReply, FastifyRequest } from "fastify";

export async function listWorkoutExercisesHandler(
  request: FastifyRequest<{ Params: { dayId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const exercises = await request.server.useCases.listWorkoutExercises.execute({
    dayId: request.params.dayId,
    userId,
  });
  const body = exercises.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
