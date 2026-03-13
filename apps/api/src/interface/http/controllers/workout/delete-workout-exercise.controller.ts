import type { FastifyReply, FastifyRequest } from "fastify";

export async function deleteWorkoutExerciseHandler(
  request: FastifyRequest<{ Params: { dayId: string; exerciseId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  await request.server.useCases.deleteWorkoutExercise.execute({
    dayId: request.params.dayId,
    exerciseId: request.params.exerciseId,
    userId,
  });
  return reply.status(204).send();
}
