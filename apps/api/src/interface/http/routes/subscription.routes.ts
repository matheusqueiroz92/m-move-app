import {
  checkoutSessionResponseSchema,
  createCheckoutBodySchema,
  createPortalBodySchema,
  portalSessionResponseSchema,
  subscriptionStatusResponseSchema,
} from "@m-move-app/validators";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { createCheckoutHandler } from "../controllers/subscription/create-checkout.controller.js";
import { createPortalHandler } from "../controllers/subscription/create-portal.controller.js";
import { getSubscriptionStatusHandler } from "../controllers/subscription/get-status.controller.js";
import { stripeWebhookHandler } from "../controllers/subscription/webhook.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function subscriptionRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.post("/checkout", {
    preHandler: [authenticate],
    schema: {
      description: "Create Stripe Checkout session for subscription",
      body: createCheckoutBodySchema,
      response: { 200: checkoutSessionResponseSchema },
    },
    handler: createCheckoutHandler,
  });

  typed.post("/portal", {
    preHandler: [authenticate],
    schema: {
      description: "Create Stripe Customer Portal session",
      body: createPortalBodySchema,
      response: { 200: portalSessionResponseSchema },
    },
    handler: createPortalHandler,
  });

  typed.get("/status", {
    preHandler: [authenticate],
    schema: {
      description: "Get current user subscription status",
      response: { 200: subscriptionStatusResponseSchema },
    },
    handler: getSubscriptionStatusHandler,
  });

  typed.post("/webhook", {
    preParsing: (request, _reply, payload, done) => {
      request.headers["content-type"] = "text/plain";
      done(null, payload);
    },
    schema: {
      description: "Stripe webhook (signature verified)",
      hide: true,
    },
    handler: stripeWebhookHandler,
  });
}
