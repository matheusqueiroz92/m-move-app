import type { FastifyReply, FastifyRequest } from "fastify";

import { CreateWorkoutPlanUseCase } from "../../../../application/workout/create-workout-plan.use-case.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(
  workoutPlanRepository,
);

export async function createWorkoutPlanHandler(
  request: FastifyRequest<{
    Body: { name: string; description?: string | null };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const body = request.body;
  const plan = await createWorkoutPlanUseCase.execute({
    userId,
    name: body.name,
    description: body.description,
    createdBy: userId,
  });

  return reply.status(201).send({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  });
}
