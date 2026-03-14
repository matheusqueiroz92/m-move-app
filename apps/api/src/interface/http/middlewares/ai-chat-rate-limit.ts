import type { PlanType } from "@m-move-app/constants";
import type { FastifyReply, FastifyRequest } from "fastify";

import type { AIChatMessageRepository } from "../../../domain/ai/repositories/ai-chat-message.repository.js";
import type { UserRepository } from "../../../domain/user/repositories/user.repository.js";

const PLAN_LIMITS: Record<PlanType, number | null> = {
  STUDENT: 50,
  PERSONAL: 200,
  GYM: null,
};

function getTodayRange(timezone: string): { start: Date; end: Date } {
  const now = new Date();
  const localeString = now.toLocaleString("en-US", { timeZone: timezone });
  const local = new Date(localeString);

  const start = new Date(
    local.getFullYear(),
    local.getMonth(),
    local.getDate(),
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    local.getFullYear(),
    local.getMonth(),
    local.getDate(),
    23,
    59,
    59,
    999,
  );

  return { start, end };
}

export function createAIChatRateLimitMiddleware(deps: {
  userRepository: UserRepository;
  aiChatMessageRepository: AIChatMessageRepository;
}) {
  const { userRepository, aiChatMessageRepository } = deps;

  return async function aiChatRateLimit(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const user = await userRepository.findByIdWithPlanAndTimezone(userId);
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const planType = user.planType;
    const timezone =
      user.timezone && typeof user.timezone === "string"
        ? user.timezone
        : "America/Sao_Paulo";

    if (!planType) {
      return;
    }

    const limit = PLAN_LIMITS[planType];
    if (limit == null) {
      return;
    }

    const { start, end } = getTodayRange(timezone);
    const todayCount = await aiChatMessageRepository.countUserMessagesByDateRange(
      userId,
      start,
      end,
    );

    if (todayCount >= limit) {
      return reply.status(429).send({
        message: "Daily AI chat message limit reached for your plan",
      });
    }
  };
}
