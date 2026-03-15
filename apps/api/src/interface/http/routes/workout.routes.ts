import {
  createWorkoutDayBodySchema,
  createWorkoutPlanBodySchema,
  paginationQuerystringSchema,
  updateWorkoutDayBodySchema,
  updateWorkoutPlanBodySchema,
  workoutDayListResponseSchema,
  workoutDayResponseSchema,
  workoutPlanPaginatedResponseSchema,
  workoutPlanResponseSchema,
} from "@m-move-app/validators";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { activateWorkoutPlanHandler } from "../controllers/workout/activate-workout-plan.controller.js";
import { createWorkoutDayHandler } from "../controllers/workout/create-workout-day.controller.js";
import { createWorkoutPlanHandler } from "../controllers/workout/create-workout-plan.controller.js";
import { deleteWorkoutDayHandler } from "../controllers/workout/delete-workout-day.controller.js";
import { deleteWorkoutPlanHandler } from "../controllers/workout/delete-workout-plan.controller.js";
import { getWorkoutPlanByIdHandler } from "../controllers/workout/get-workout-plan-by-id.controller.js";
import { listWorkoutDaysHandler } from "../controllers/workout/list-workout-days.controller.js";
import { listWorkoutPlansHandler } from "../controllers/workout/list-workout-plans.controller.js";
import { updateWorkoutDayHandler } from "../controllers/workout/update-workout-day.controller.js";
import { updateWorkoutPlanHandler } from "../controllers/workout/update-workout-plan.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireActivePlan } from "../middlewares/require-active-plan.js";
import { requireNotLinkedStudent } from "../middlewares/require-not-linked-student.js";

export async function workoutRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get("/", {
    preHandler: [authenticate, requireActivePlan],
    schema: {
      description: "List all workout plans for the authenticated user (paginated)",
      querystring: paginationQuerystringSchema,
      response: {
        200: workoutPlanPaginatedResponseSchema,
      },
    },
    handler: listWorkoutPlansHandler,
  });

  typed.get("/:planId/days", {
    preHandler: [authenticate, requireActivePlan],
    schema: {
      description: "List all days of a workout plan (plan must belong to user)",
      params: z.object({ planId: z.string().min(1) }),
      response: {
        200: workoutDayListResponseSchema,
      },
    },
    handler: listWorkoutDaysHandler,
  });

  typed.post("/:planId/days", {
    preHandler: [authenticate, requireActivePlan, requireNotLinkedStudent],
    schema: {
      description: "Create a day in a workout plan (plan must belong to user)",
      params: z.object({ planId: z.string().min(1) }),
      body: createWorkoutDayBodySchema,
      response: {
        201: workoutDayResponseSchema,
      },
    },
    handler: createWorkoutDayHandler,
  });

  typed.patch("/:planId/days/:dayId", {
    preHandler: [authenticate, requireActivePlan, requireNotLinkedStudent],
    schema: {
      description: "Update a workout day (plan must belong to user)",
      params: z.object({ planId: z.string().min(1), dayId: z.string().min(1) }),
      body: updateWorkoutDayBodySchema,
      response: {
        200: workoutDayResponseSchema,
      },
    },
    handler: updateWorkoutDayHandler,
  });

  typed.delete("/:planId/days/:dayId", {
    preHandler: [authenticate, requireActivePlan, requireNotLinkedStudent],
    schema: {
      description: "Delete a workout day (plan must belong to user)",
      params: z.object({ planId: z.string().min(1), dayId: z.string().min(1) }),
      response: { 204: z.object({}) },
    },
    handler: deleteWorkoutDayHandler,
  });

  typed.get("/:id", {
    preHandler: [authenticate, requireActivePlan],
    schema: {
      description:
        "Get a workout plan by id (must belong to authenticated user)",
      params: z.object({ id: z.string().min(1) }),
      response: {
        200: workoutPlanResponseSchema,
      },
    },
    handler: getWorkoutPlanByIdHandler,
  });

  typed.post("/", {
    preHandler: [authenticate, requireActivePlan, requireNotLinkedStudent],
    schema: {
      description: "Create a new workout plan for the authenticated user",
      body: createWorkoutPlanBodySchema,
      response: {
        201: workoutPlanResponseSchema,
      },
    },
    handler: createWorkoutPlanHandler,
  });

  typed.patch("/:id", {
    preHandler: [authenticate, requireActivePlan, requireNotLinkedStudent],
    schema: {
      description: "Update a workout plan (plan must belong to user)",
      params: z.object({ id: z.string().min(1) }),
      body: updateWorkoutPlanBodySchema,
      response: {
        200: workoutPlanResponseSchema,
      },
    },
    handler: updateWorkoutPlanHandler,
  });

  typed.delete("/:id", {
    preHandler: [authenticate, requireActivePlan, requireNotLinkedStudent],
    schema: {
      description: "Delete a workout plan (plan must belong to user)",
      params: z.object({ id: z.string().min(1) }),
      response: { 204: z.object({}) },
    },
    handler: deleteWorkoutPlanHandler,
  });

  typed.post("/:id/activate", {
    preHandler: [authenticate, requireActivePlan, requireNotLinkedStudent],
    schema: {
      description:
        "Activate a workout plan (deactivates other plans of the user)",
      params: z.object({ id: z.string().min(1) }),
      response: {
        200: workoutPlanResponseSchema,
      },
    },
    handler: activateWorkoutPlanHandler,
  });
}
