import type { FastifyReply, FastifyRequest } from "fastify";

import { DayNotFoundError } from "../../../../domain/workout/errors/day-not-found.error.js";
import { ReorderWorkoutExercisesUseCase } from "../../../../application/workout/reorder-workout-exercises.use-case.js";
import { PrismaWorkoutExerciseRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-exercise.repository.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const workoutExerciseRepository = new PrismaWorkoutExerciseRepository();
const reorderWorkoutExercisesUseCase = new ReorderWorkoutExercisesUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);

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

  try {
    const exercises = await reorderWorkoutExercisesUseCase.execute({
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
  } catch (error) {
    if (error instanceof DayNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
