import type { FastifyInstance } from "fastify";

import { createErrorHandler } from "../error-handler.js";
import { aiRoutes } from "../routes/ai.routes.js";
import {
  assessmentHistoryRoutes,
  assessmentRoutes,
} from "../routes/assessment.routes.js";
import { gymRoutes } from "../routes/gym.routes.js";
import { ptInvitesRoutes } from "../routes/pt-invites.routes.js";
import { sessionRoutes } from "../routes/session.routes.js";
import { subscriptionRoutes } from "../routes/subscription.routes.js";
import { userRoutes } from "../routes/user.routes.js";
import { workoutRoutes } from "../routes/workout.routes.js";
import { workoutDaysRoutes } from "../routes/workout-days.routes.js";

export async function apiRoutesPlugin(
  instance: FastifyInstance,
): Promise<void> {
  instance.setErrorHandler(
    createErrorHandler((err, req) =>
      (req?.log ?? instance.log).error(err),
    ),
  );

  await instance.register(userRoutes, { prefix: "/api/users" });
  await instance.register(workoutRoutes, { prefix: "/api/workout-plans" });
  await instance.register(workoutDaysRoutes, { prefix: "/api/workout-days" });
  await instance.register(sessionRoutes, { prefix: "/api/sessions" });
  await instance.register(assessmentHistoryRoutes, {
    prefix: "/api/assessments/history",
  });
  await instance.register(assessmentRoutes, { prefix: "/api/assessments" });
  await instance.register(gymRoutes, { prefix: "/api/gym" });
  await instance.register(ptInvitesRoutes, { prefix: "/api/pt/invites" });
  await instance.register(subscriptionRoutes, {
    prefix: "/api/subscriptions",
  });
  await instance.register(aiRoutes, { prefix: "/api/ai" });
}
