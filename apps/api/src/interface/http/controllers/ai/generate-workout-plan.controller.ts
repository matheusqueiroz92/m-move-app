import type { FastifyReply, FastifyRequest } from "fastify";

export async function generateWorkoutPlanHandler(
  request: FastifyRequest<{
    Body: {
      objective: string;
      level: string;
      daysPerWeek: number;
      equipment?: string[];
      restrictions?: string;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const result = await request.server.useCases.generateWorkoutPlanWithAI.execute({
    userId,
    objective: request.body.objective,
    level: request.body.level,
    daysPerWeek: request.body.daysPerWeek,
    equipment: request.body.equipment,
    restrictions: request.body.restrictions,
  });
  return reply.status(201).send(result);
}
