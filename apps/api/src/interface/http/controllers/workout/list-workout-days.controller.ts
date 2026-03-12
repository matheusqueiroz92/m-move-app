import type { FastifyReply, FastifyRequest } from "fastify";

import { ListWorkoutDaysUseCase } from "../../../../application/workout/list-workout-days.use-case.js";
import { PlanNotFoundError } from "../../../../domain/workout/errors/plan-not-found.error.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const listWorkoutDaysUseCase = new ListWorkoutDaysUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);

export async function listWorkoutDaysHandler(
  request: FastifyRequest<{ Params: { planId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const days = await listWorkoutDaysUseCase.execute({
      planId: request.params.planId,
      userId,
    });
    const body = days.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
    return reply.status(200).send(body);
  } catch (error) {
    if (error instanceof PlanNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
