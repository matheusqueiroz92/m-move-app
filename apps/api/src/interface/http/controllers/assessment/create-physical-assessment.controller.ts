import type { FastifyReply, FastifyRequest } from "fastify";

import { CreatePhysicalAssessmentUseCase } from "../../../../application/assessment/create-physical-assessment.use-case.js";
import { PrismaPhysicalAssessmentRepository } from "../../../../infrastructure/database/prisma/repositories/prisma-physical-assessment.repository.js";

const repository = new PrismaPhysicalAssessmentRepository();
const useCase = new CreatePhysicalAssessmentUseCase(repository);

export async function createPhysicalAssessmentHandler(
  request: FastifyRequest<{
    Body: {
      userId?: string;
      assessedBy?: string | null;
      weightKg: number;
      heightCm: number;
      bodyFatPct?: number | null;
      muscleMassPct?: number | null;
      chestCm?: number | null;
      waistCm?: number | null;
      hipsCm?: number | null;
      leftArmCm?: number | null;
      rightArmCm?: number | null;
      leftThighCm?: number | null;
      rightThighCm?: number | null;
      notes?: string | null;
    };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const body = request.body;
  const assessment = await useCase.execute({
    userId: body.userId ?? userId,
    assessedBy: body.assessedBy,
    weightKg: body.weightKg,
    heightCm: body.heightCm,
    bodyFatPct: body.bodyFatPct,
    muscleMassPct: body.muscleMassPct,
    chestCm: body.chestCm,
    waistCm: body.waistCm,
    hipsCm: body.hipsCm,
    leftArmCm: body.leftArmCm,
    rightArmCm: body.rightArmCm,
    leftThighCm: body.leftThighCm,
    rightThighCm: body.rightThighCm,
    notes: body.notes,
  });

  return reply.status(201).send({
    ...assessment,
    assessedAt: assessment.assessedAt.toISOString(),
  });
}
