import {
  acceptPtInviteBodySchema,
  paginationQuerystringSchema,
  ptInvitePaginatedResponseSchema,
  ptInviteResponseSchema,
  sendPtInviteBodySchema,
} from "@m-move-app/validators";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { acceptPtInviteHandler } from "../controllers/pt-invite/accept-pt-invite.controller.js";
import { listPtInvitesHandler } from "../controllers/pt-invite/list-pt-invites.controller.js";
import { revokePtInviteHandler } from "../controllers/pt-invite/revoke-pt-invite.controller.js";
import { sendPtInviteHandler } from "../controllers/pt-invite/send-pt-invite.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/authorize.js";
import { requireActivePlan } from "../middlewares/require-active-plan.js";

export async function ptInvitesRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.post("/", {
    preHandler: [authenticate, requireActivePlan, requireRole(["PERSONAL_TRAINER"])],
    schema: {
      description: "Send invite to student (PERSONAL_TRAINER only)",
      body: sendPtInviteBodySchema,
      response: { 201: ptInviteResponseSchema },
    },
    handler: sendPtInviteHandler,
  });

  typed.get("/", {
    preHandler: [authenticate, requireActivePlan, requireRole(["PERSONAL_TRAINER"])],
    schema: {
      description: "List PT invites (PERSONAL_TRAINER only) (paginated)",
      querystring: paginationQuerystringSchema,
      response: { 200: ptInvitePaginatedResponseSchema },
    },
    handler: listPtInvitesHandler,
  });

  typed.post("/accept", {
    preHandler: [authenticate],
    schema: {
      description: "Accept invite by token (authenticated user becomes linked student)",
      body: acceptPtInviteBodySchema,
      response: { 200: ptInviteResponseSchema },
    },
    handler: acceptPtInviteHandler,
  });

  typed.delete("/:id", {
    preHandler: [authenticate, requireActivePlan, requireRole(["PERSONAL_TRAINER"])],
    schema: {
      description: "Revoke invite (PERSONAL_TRAINER only, own invites)",
      params: z.object({ id: z.string().uuid() }),
      response: { 204: z.object({}) },
    },
    handler: revokePtInviteHandler,
  });
}
