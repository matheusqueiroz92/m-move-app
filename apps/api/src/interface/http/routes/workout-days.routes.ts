import {
  createWorkoutExerciseBodySchema,
  reorderExercisesBodySchema,
  updateWorkoutExerciseBodySchema,
  workoutExerciseListResponseSchema,
  workoutExerciseResponseSchema,
} from "@m-move-app/validators";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { createWorkoutExerciseHandler } from "../controllers/workout/create-workout-exercise.controller.js";
import { deleteWorkoutExerciseHandler } from "../controllers/workout/delete-workout-exercise.controller.js";
import { listWorkoutExercisesHandler } from "../controllers/workout/list-workout-exercises.controller.js";
import { reorderWorkoutExercisesHandler } from "../controllers/workout/reorder-workout-exercises.controller.js";
import { updateWorkoutExerciseHandler } from "../controllers/workout/update-workout-exercise.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function workoutDaysRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get("/:dayId/exercises", {
    preHandler: [authenticate],
    schema: {
      description:
        "List all exercises of a workout day (day's plan must belong to user)",
      params: z.object({ dayId: z.string().min(1) }),
      response: {
        200: workoutExerciseListResponseSchema,
      },
    },
    handler: listWorkoutExercisesHandler,
  });

  typed.post("/:dayId/exercises", {
    preHandler: [authenticate],
    schema: {
      description:
        "Create an exercise in a workout day (day's plan must belong to user)",
      params: z.object({ dayId: z.string().min(1) }),
      body: createWorkoutExerciseBodySchema,
      response: {
        201: workoutExerciseResponseSchema,
      },
    },
    handler: createWorkoutExerciseHandler,
  });

  typed.patch("/:dayId/exercises/reorder", {
    preHandler: [authenticate],
    schema: {
      description:
        "Reorder exercises (day's plan must belong to user). Pass exercise ids in desired order.",
      params: z.object({ dayId: z.string().min(1) }),
      body: reorderExercisesBodySchema,
      response: {
        200: workoutExerciseListResponseSchema,
      },
    },
    handler: reorderWorkoutExercisesHandler,
  });

  typed.patch("/:dayId/exercises/:exerciseId", {
    preHandler: [authenticate],
    schema: {
      description: "Update an exercise (day's plan must belong to user)",
      params: z.object({
        dayId: z.string().min(1),
        exerciseId: z.string().min(1),
      }),
      body: updateWorkoutExerciseBodySchema,
      response: {
        200: workoutExerciseResponseSchema,
      },
    },
    handler: updateWorkoutExerciseHandler,
  });

  typed.delete("/:dayId/exercises/:exerciseId", {
    preHandler: [authenticate],
    schema: {
      description: "Delete an exercise (day's plan must belong to user)",
      params: z.object({
        dayId: z.string().min(1),
        exerciseId: z.string().min(1),
      }),
      response: { 204: z.object({}) },
    },
    handler: deleteWorkoutExerciseHandler,
  });
}
