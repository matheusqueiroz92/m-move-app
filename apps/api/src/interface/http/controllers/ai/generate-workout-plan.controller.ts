import type { FastifyReply, FastifyRequest } from "fastify";

import { GenerateWorkoutPlanWithAIUseCase } from "../../../../application/ai/generate-workout-plan-with-ai.use-case.js";
import { PrismaWorkoutDayRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutExerciseRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-exercise.repository.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";
import { OpenAIPlanProviderImpl } from "../../../../infrastructure/providers/openai-provider.js";

const aiProvider = new OpenAIPlanProviderImpl();
const planRepo = new PrismaWorkoutPlanRepository();
const dayRepo = new PrismaWorkoutDayRepository();
const exerciseRepo = new PrismaWorkoutExerciseRepository();
const useCase = new GenerateWorkoutPlanWithAIUseCase(
  aiProvider,
  planRepo,
  dayRepo,
  exerciseRepo,
);

export async function generateWorkoutPlanHandler(
  request: FastifyRequest<{
    Body: {
      objective: string;
      level: string;
      daysPerWeek: number;
      equipment?: string[];
      restrictions?: string;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const result = await useCase.execute({
      userId,
      objective: request.body.objective,
      level: request.body.level,
      daysPerWeek: request.body.daysPerWeek,
      equipment: request.body.equipment,
      restrictions: request.body.restrictions,
    });
    return reply.status(201).send(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate plan";
    if (message.includes("OPENAI_API_KEY")) {
      return reply.status(503).send({ message });
    }
    return reply.status(500).send({ message });
  }
}
