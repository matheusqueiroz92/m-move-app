import type { FastifyReply, FastifyRequest } from "fastify";

export async function reorderWorkoutExercisesHandler(
  request: FastifyRequest<{
    Params: { dayId: string };
    Body: { exerciseIdsInOrder: string[] };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const exercises = await request.server.useCases.reorderWorkoutExercises.execute({
    dayId: request.params.dayId,
    userId,
    exerciseIdsInOrder: request.body.exerciseIdsInOrder,
  });
  const body = exercises.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
