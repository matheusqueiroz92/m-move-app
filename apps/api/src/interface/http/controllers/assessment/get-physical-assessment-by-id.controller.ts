import type { FastifyReply, FastifyRequest } from "fastify";

import { GetPhysicalAssessmentByIdUseCase } from "../../../../application/assessment/get-physical-assessment-by-id.use-case.js";
import { AssessmentNotFoundError } from "../../../../domain/assessment/errors/assessment-not-found.error.js";
import { PrismaPhysicalAssessmentRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-physical-assessment.repository.js";

const repository = new PrismaPhysicalAssessmentRepository();
const useCase = new GetPhysicalAssessmentByIdUseCase(repository);

export async function getPhysicalAssessmentByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const assessment = await useCase.execute({ id: request.params.id });
    if (assessment.userId !== userId && assessment.assessedBy !== userId) {
      return reply.status(403).send({ message: "Forbidden" });
    }
    return reply.status(200).send({
      ...assessment,
      assessedAt: assessment.assessedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AssessmentNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
