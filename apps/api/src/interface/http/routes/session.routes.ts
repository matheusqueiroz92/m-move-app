import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  startSessionBodySchema,
  workoutSessionListResponseSchema,
  workoutSessionResponseSchema,
  streakResponseSchema,
} from "@m-move-app/validators";

import { completeSessionHandler } from "../controllers/session/complete-session.controller.js";
import { getSessionHistoryHandler } from "../controllers/session/get-history.controller.js";
import { getStreakHandler } from "../controllers/session/get-streak.controller.js";
import { startSessionHandler } from "../controllers/session/start-session.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function sessionRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get("/history", {
    preHandler: [authenticate],
    schema: {
      description: "List workout session history for authenticated user",
      querystring: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      }),
      response: {
        200: workoutSessionListResponseSchema,
      },
    },
    handler: getSessionHistoryHandler,
  });

  typed.get("/streak", {
    preHandler: [authenticate],
    schema: {
      description:
        "Get current streak (consecutive days with completed sessions)",
      querystring: z.object({
        timezone: z.string().optional(),
      }),
      response: {
        200: streakResponseSchema,
      },
    },
    handler: getStreakHandler,
  });

  typed.post("/start", {
    preHandler: [authenticate],
    schema: {
      description:
        "Start a workout session for a day (day must belong to user's plan)",
      body: startSessionBodySchema,
      response: {
        201: workoutSessionResponseSchema,
      },
    },
    handler: startSessionHandler,
  });

  typed.patch("/:id/complete", {
    preHandler: [authenticate],
    schema: {
      description: "Complete a workout session (only own session)",
      params: z.object({ id: z.string().min(1) }),
      response: {
        200: workoutSessionResponseSchema,
      },
    },
    handler: completeSessionHandler,
  });
}
