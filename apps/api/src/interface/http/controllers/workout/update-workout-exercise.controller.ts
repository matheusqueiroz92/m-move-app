import type { FastifyReply, FastifyRequest } from "fastify";

import { DayNotFoundError } from "../../../../domain/workout/errors/day-not-found.error.js";
import { ExerciseNotFoundError } from "../../../../domain/workout/errors/exercise-not-found.error.js";
import { UpdateWorkoutExerciseUseCase } from "../../../../application/workout/update-workout-exercise.use-case.js";
import { PrismaWorkoutExerciseRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-exercise.repository.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const workoutExerciseRepository = new PrismaWorkoutExerciseRepository();
const updateWorkoutExerciseUseCase = new UpdateWorkoutExerciseUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);

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

  try {
    const body = request.body;
    const exercise = await updateWorkoutExerciseUseCase.execute({
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
  } catch (error) {
    if (error instanceof DayNotFoundError || error instanceof ExerciseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
