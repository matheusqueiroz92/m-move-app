import {
  createPhysicalAssessmentBodySchema,
  paginationQuerystringSchema,
  physicalAssessmentPaginatedResponseSchema,
  physicalAssessmentResponseSchema,
} from "@m-move-app/validators";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { createPhysicalAssessmentHandler } from "../controllers/assessment/create-physical-assessment.controller.js";
import { getHistoryPhysicalAssessmentsHandler } from "../controllers/assessment/get-history-physical-assessments.controller.js";
import { getPhysicalAssessmentByIdHandler } from "../controllers/assessment/get-physical-assessment-by-id.controller.js";
import { listPhysicalAssessmentsHandler } from "../controllers/assessment/list-physical-assessments.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function assessmentRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get("/", {
    preHandler: [authenticate],
    schema: {
      description:
        "List physical assessments of the authenticated user (paginated)",
      querystring: paginationQuerystringSchema,
      response: {
        200: physicalAssessmentPaginatedResponseSchema,
      },
    },
    handler: listPhysicalAssessmentsHandler,
  });

  typed.post("/", {
    preHandler: [authenticate],
    schema: {
      description: "Create a physical assessment (for self or, if PT, for a student)",
      body: createPhysicalAssessmentBodySchema,
      response: {
        201: physicalAssessmentResponseSchema,
      },
    },
    handler: createPhysicalAssessmentHandler,
  });

  typed.get("/:id", {
    preHandler: [authenticate],
    schema: {
      description: "Get a physical assessment by id (must be owner or assessor)",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: physicalAssessmentResponseSchema,
      },
    },
    handler: getPhysicalAssessmentByIdHandler,
  });
}

export async function assessmentHistoryRoutes(
  app: FastifyInstance,
): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get("/:userId", {
    preHandler: [authenticate],
    schema: {
      description:
        "List physical assessments history for a user (own userId only) (paginated)",
      params: z.object({ userId: z.string().uuid() }),
      querystring: paginationQuerystringSchema,
      response: {
        200: physicalAssessmentPaginatedResponseSchema,
      },
    },
    handler: getHistoryPhysicalAssessmentsHandler,
  });
}
