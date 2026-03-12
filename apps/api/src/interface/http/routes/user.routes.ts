import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { userProfileResponseSchema } from "@m-move-app/validators";
import { getProfileHandler } from "../controllers/user/get-profile.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();
  typed.get("/me", {
    preHandler: [authenticate],
    schema: {
      description: "Returns the profile of the authenticated user",
      response: {
        200: userProfileResponseSchema,
      },
    },
    handler: getProfileHandler,
  });
}
