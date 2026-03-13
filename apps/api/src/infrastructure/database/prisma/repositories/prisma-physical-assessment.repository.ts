import type {
  CreatePhysicalAssessmentInput,
  PhysicalAssessmentRepository,
  PhysicalAssessmentResult,
} from "../../../../domain/assessment/repositories/physical-assessment.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toPhysicalAssessmentResult } from "../mappers/physical-assessment.mapper.js";

export class PrismaPhysicalAssessmentRepository implements PhysicalAssessmentRepository {
  async create(
    input: CreatePhysicalAssessmentInput,
  ): Promise<PhysicalAssessmentResult> {
    const assessment = await prisma.physicalAssessment.create({
      data: {
        userId: input.userId,
        assessedBy: input.assessedBy ?? undefined,
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        bodyFatPct: input.bodyFatPct ?? undefined,
        muscleMassPct: input.muscleMassPct ?? undefined,
        chestCm: input.chestCm ?? undefined,
        waistCm: input.waistCm ?? undefined,
        hipsCm: input.hipsCm ?? undefined,
        leftArmCm: input.leftArmCm ?? undefined,
        rightArmCm: input.rightArmCm ?? undefined,
        leftThighCm: input.leftThighCm ?? undefined,
        rightThighCm: input.rightThighCm ?? undefined,
        notes: input.notes ?? undefined,
      },
    });
    return toPhysicalAssessmentResult(assessment);
  }

  async findById(id: string): Promise<PhysicalAssessmentResult | null> {
    const assessment = await prisma.physicalAssessment.findUnique({
      where: { id },
    });
    return assessment ? toPhysicalAssessmentResult(assessment) : null;
  }

  async findByUserId(userId: string): Promise<PhysicalAssessmentResult[]> {
    const assessments = await prisma.physicalAssessment.findMany({
      where: { userId },
      orderBy: { assessedAt: "desc" },
    });
    return assessments.map(toPhysicalAssessmentResult);
  }
}
