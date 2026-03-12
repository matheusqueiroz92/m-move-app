import type { FastifyReply, FastifyRequest } from "fastify";

import { DayNotFoundError } from "../../../../domain/workout/errors/day-not-found.error.js";
import { ExerciseNotFoundError } from "../../../../domain/workout/errors/exercise-not-found.error.js";
import { DeleteWorkoutExerciseUseCase } from "../../../../application/workout/delete-workout-exercise.use-case.js";
import { PrismaWorkoutExerciseRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-exercise.repository.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const workoutExerciseRepository = new PrismaWorkoutExerciseRepository();
const deleteWorkoutExerciseUseCase = new DeleteWorkoutExerciseUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);

export async function deleteWorkoutExerciseHandler(
  request: FastifyRequest<{ Params: { dayId: string; exerciseId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    await deleteWorkoutExerciseUseCase.execute({
      dayId: request.params.dayId,
      exerciseId: request.params.exerciseId,
      userId,
    });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof DayNotFoundError || error instanceof ExerciseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
