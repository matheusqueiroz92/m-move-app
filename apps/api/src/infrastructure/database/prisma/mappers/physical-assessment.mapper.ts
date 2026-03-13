import type { PhysicalAssessmentResult } from "../../../../domain/assessment/repositories/physical-assessment.repository.js";
import type { PhysicalAssessment } from "../../../../generated/prisma/client.js";

export function toPhysicalAssessmentResult(
  assessment: PhysicalAssessment,
): PhysicalAssessmentResult {
  return {
    id: assessment.id,
    userId: assessment.userId,
    assessedBy: assessment.assessedBy ?? null,
    weightKg: assessment.weightKg,
    heightCm: assessment.heightCm,
    bodyFatPct: assessment.bodyFatPct ?? null,
    muscleMassPct: assessment.muscleMassPct ?? null,
    chestCm: assessment.chestCm ?? null,
    waistCm: assessment.waistCm ?? null,
    hipsCm: assessment.hipsCm ?? null,
    leftArmCm: assessment.leftArmCm ?? null,
    rightArmCm: assessment.rightArmCm ?? null,
    leftThighCm: assessment.leftThighCm ?? null,
    rightThighCm: assessment.rightThighCm ?? null,
    notes: assessment.notes ?? null,
    assessedAt: assessment.assessedAt,
  };
}
