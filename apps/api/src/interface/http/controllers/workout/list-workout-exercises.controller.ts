import type { FastifyReply, FastifyRequest } from "fastify";

import { DayNotFoundError } from "../../../../domain/workout/errors/day-not-found.error.js";
import { ListWorkoutExercisesUseCase } from "../../../../application/workout/list-workout-exercises.use-case.js";
import { PrismaWorkoutExerciseRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-exercise.repository.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const workoutExerciseRepository = new PrismaWorkoutExerciseRepository();
const listWorkoutExercisesUseCase = new ListWorkoutExercisesUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);

export async function listWorkoutExercisesHandler(
  request: FastifyRequest<{ Params: { dayId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const exercises = await listWorkoutExercisesUseCase.execute({
      dayId: request.params.dayId,
      userId,
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
