import {
  aiChatPaginatedResponseSchema,
  chatResponseSchema,
  generateWorkoutPlanBodySchema,
  generateWorkoutPlanResponseSchema,
  insightsResponseSchema,
  paginationQuerystringSchema,
  sendChatMessageBodySchema,
} from "@m-move-app/validators";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { generateWorkoutPlanHandler } from "../controllers/ai/generate-workout-plan.controller.js";
import { getInsightsHandler } from "../controllers/ai/get-insights.controller.js";
import { listChatsHandler } from "../controllers/ai/list-chats.controller.js";
import { sendChatMessageHandler } from "../controllers/ai/send-chat-message.controller.js";
import { createAIChatRateLimitMiddleware } from "../middlewares/ai-chat-rate-limit.js";
import { authenticate } from "../middlewares/authenticate.js";

const messageResponseSchema = z.object({ message: z.string() });

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.post("/generate-plan", {
    preHandler: [authenticate],
    schema: {
      description: "Generate a workout plan using AI (GPT-4o)",
      body: generateWorkoutPlanBodySchema,
      response: {
        201: generateWorkoutPlanResponseSchema,
        401: messageResponseSchema,
        500: messageResponseSchema,
        503: messageResponseSchema,
      },
    },
    handler: generateWorkoutPlanHandler,
  });

  typed.get("/chats", {
    preHandler: [authenticate],
    schema: {
      description:
        "List AI chats for the authenticated user (paginated)",
      querystring: paginationQuerystringSchema,
      response: {
        200: aiChatPaginatedResponseSchema,
        401: messageResponseSchema,
      },
    },
    handler: listChatsHandler,
  });

  typed.post("/chat", {
    preHandler: [
      authenticate,
      createAIChatRateLimitMiddleware({
        userRepository: app.userRepository,
        aiChatMessageRepository: app.aiChatMessageRepository,
      }),
    ],
    schema: {
      description:
        "Send a message to the AI chat (creates chat if chatId is null)",
      body: sendChatMessageBodySchema,
      response: {
        200: chatResponseSchema,
        401: messageResponseSchema,
        404: messageResponseSchema,
        500: messageResponseSchema,
        503: messageResponseSchema,
      },
    },
    handler: sendChatMessageHandler,
  });

  typed.get("/insights/:userId", {
    preHandler: [authenticate],
    schema: {
      description:
        "Get AI-generated progress insights for a user (own userId only)",
      params: z.object({ userId: z.string().uuid() }),
      response: {
        200: insightsResponseSchema,
        401: messageResponseSchema,
        403: messageResponseSchema,
        500: messageResponseSchema,
        503: messageResponseSchema,
      },
    },
    handler: getInsightsHandler,
  });
}
