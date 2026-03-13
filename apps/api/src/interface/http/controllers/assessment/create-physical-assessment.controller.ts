import type { FastifyReply, FastifyRequest } from "fastify";

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
  const userId = request.userId!;

  const body = request.body;
  const assessment = await request.server.useCases.createPhysicalAssessment.execute({
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
