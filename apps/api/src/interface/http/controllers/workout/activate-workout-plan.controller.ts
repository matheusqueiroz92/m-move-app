import type { FastifyReply, FastifyRequest } from "fastify";

import { ActivateWorkoutPlanUseCase } from "../../../../application/workout/activate-workout-plan.use-case.js";
import { PlanNotFoundError } from "../../../../domain/workout/errors/plan-not-found.error.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const activateWorkoutPlanUseCase = new ActivateWorkoutPlanUseCase(
  workoutPlanRepository,
);

export async function activateWorkoutPlanHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const plan = await activateWorkoutPlanUseCase.execute({
      planId: request.params.id,
      userId,
    });
    return reply.status(200).send({
      ...plan,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof PlanNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
