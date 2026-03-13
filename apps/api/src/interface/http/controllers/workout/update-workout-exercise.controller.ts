import type { FastifyReply, FastifyRequest } from "fastify";

export async function updateWorkoutExerciseHandler(
  request: FastifyRequest<{
    Params: { dayId: string; exerciseId: string };
    Body: {
      name?: string;
      order?: number;
      description?: string | null;
      sets?: number;
      reps?: number;
      weightKg?: number | null;
      restTimeInSeconds?: number;
      notes?: string | null;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const body = request.body;
  const exercise = await request.server.useCases.updateWorkoutExercise.execute({
    dayId: request.params.dayId,
    exerciseId: request.params.exerciseId,
    userId,
    name: body.name,
    order: body.order,
    description: body.description,
    sets: body.sets,
    reps: body.reps,
    weightKg: body.weightKg,
    restTimeInSeconds: body.restTimeInSeconds,
    notes: body.notes,
  });
  return reply.status(200).send({
    ...exercise,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  });
}
