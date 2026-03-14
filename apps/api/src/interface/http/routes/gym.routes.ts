import {
  createGymBodySchema,
  gymInstructorPaginatedResponseSchema,
  gymInstructorResponseSchema,
  gymResponseSchema,
  inviteInstructorBodySchema,
  paginationQuerystringSchema,
  updateGymBodySchema,
} from "@m-move-app/validators";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { createGymHandler } from "../controllers/gym/create-gym.controller.js";
import { getGymByIdHandler } from "../controllers/gym/get-gym-by-id.controller.js";
import { inviteInstructorHandler } from "../controllers/gym/invite-instructor.controller.js";
import { listGymMembersHandler } from "../controllers/gym/list-gym-members.controller.js";
import { removeInstructorHandler } from "../controllers/gym/remove-instructor.controller.js";
import { updateGymHandler } from "../controllers/gym/update-gym.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/authorize.js";

export async function gymRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.post("/", {
    preHandler: [authenticate, requireRole(["OWNER"])],
    schema: {
      description: "Create a gym (OWNER only)",
      body: createGymBodySchema,
      response: {
        201: gymResponseSchema,
      },
    },
    handler: createGymHandler,
  });

  typed.get("/:id/members", {
    preHandler: [authenticate],
    schema: {
      description:
        "List gym members (instructor links). OWNER of the gym only. (paginated)",
      params: z.object({ id: z.string().uuid() }),
      querystring: paginationQuerystringSchema,
      response: {
        200: gymInstructorPaginatedResponseSchema,
      },
    },
    handler: listGymMembersHandler,
  });

  typed.get("/:id", {
    preHandler: [authenticate],
    schema: {
      description: "Get a gym by id",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: gymResponseSchema,
      },
    },
    handler: getGymByIdHandler,
  });

  typed.patch("/:id", {
    preHandler: [authenticate, requireRole(["OWNER"])],
    schema: {
      description: "Update a gym (OWNER only)",
      params: z.object({ id: z.string().uuid() }),
      body: updateGymBodySchema,
      response: {
        200: gymResponseSchema,
      },
    },
    handler: updateGymHandler,
  });

  typed.post("/members", {
    preHandler: [authenticate, requireRole(["OWNER"])],
    schema: {
      description: "Invite an instructor to a gym (OWNER only)",
      body: inviteInstructorBodySchema.extend({
        gymId: z.string().uuid(),
      }),
      response: {
        201: gymInstructorResponseSchema,
      },
    },
    handler: inviteInstructorHandler,
  });

  typed.delete("/members/:id", {
    preHandler: [authenticate, requireRole(["OWNER"])],
    schema: {
      description: "Remove an instructor link (OWNER only)",
      params: z.object({ id: z.string().uuid() }),
      response: { 204: z.object({}) },
    },
    handler: removeInstructorHandler,
  });
}
