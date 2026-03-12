import type { FastifyReply, FastifyRequest } from "fastify";

import { ListWorkoutPlansUseCase } from "../../../../application/workout/list-workout-plans.use-case.js";
import { PrismaWorkoutPlanRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";

const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const listWorkoutPlansUseCase = new ListWorkoutPlansUseCase(workoutPlanRepository);

export async function listWorkoutPlansHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const plans = await listWorkoutPlansUseCase.execute({ userId });
  const body = plans.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
