import type { FastifyReply, FastifyRequest } from "fastify";

import { ListPhysicalAssessmentsByUserUseCase } from "../../../../application/assessment/list-physical-assessments-by-user.use-case.js";
import { PrismaPhysicalAssessmentRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-physical-assessment.repository.js";

const repository = new PrismaPhysicalAssessmentRepository();
const useCase = new ListPhysicalAssessmentsByUserUseCase(repository);

export async function listPhysicalAssessmentsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const assessments = await useCase.execute({ userId });
  const body = assessments.map((a) => ({
    ...a,
    assessedAt: a.assessedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
