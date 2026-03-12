import type { FastifyReply, FastifyRequest } from "fastify";

import { DayNotFoundError } from "../../../../domain/workout/errors/day-not-found.error.js";
import { PlanNotFoundError } from "../../../../domain/workout/errors/plan-not-found.error.js";
import { DeleteWorkoutDayUseCase } from "../../../../application/workout/delete-workout-day.use-case.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const deleteWorkoutDayUseCase = new DeleteWorkoutDayUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);

export async function deleteWorkoutDayHandler(
  request: FastifyRequest<{ Params: { planId: string; dayId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    await deleteWorkoutDayUseCase.execute({
      planId: request.params.planId,
      dayId: request.params.dayId,
      userId,
    });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof PlanNotFoundError || error instanceof DayNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
