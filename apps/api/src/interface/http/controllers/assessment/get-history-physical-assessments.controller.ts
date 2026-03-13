import type { FastifyReply, FastifyRequest } from "fastify";

import { ListPhysicalAssessmentsByUserUseCase } from "../../../../application/assessment/list-physical-assessments-by-user.use-case.js";
import { PrismaPhysicalAssessmentRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-physical-assessment.repository.js";

const repository = new PrismaPhysicalAssessmentRepository();
const useCase = new ListPhysicalAssessmentsByUserUseCase(repository);

export async function getHistoryPhysicalAssessmentsHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const requestUserId = request.userId;
  if (!requestUserId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const { userId } = request.params;
  if (userId !== requestUserId) {
    return reply.status(403).send({ message: "Forbidden" });
  }

  const assessments = await useCase.execute({ userId });
  const body = assessments.map((a) => ({
    ...a,
    assessedAt: a.assessedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
