import type { FastifyReply, FastifyRequest } from "fastify";

export async function listWorkoutExercisesHandler(
  request: FastifyRequest<{ Params: { dayId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

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
