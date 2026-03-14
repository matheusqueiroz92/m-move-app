import { z } from "zod";

import { createPaginatedResponseSchema } from "./pagination.js";

const optionalFloat = z.number().min(0).optional().nullable();
const requiredFloat = z.number().min(0);

export const createPhysicalAssessmentBodySchema = z.object({
  userId: z.string().uuid().optional(),
  assessedBy: z.string().uuid().optional().nullable(),
  weightKg: requiredFloat,
  heightCm: requiredFloat,
  bodyFatPct: optionalFloat,
  muscleMassPct: optionalFloat,
  chestCm: optionalFloat,
  waistCm: optionalFloat,
  hipsCm: optionalFloat,
  leftArmCm: optionalFloat,
  rightArmCm: optionalFloat,
  leftThighCm: optionalFloat,
  rightThighCm: optionalFloat,
  notes: z.string().optional().nullable(),
});
export type CreatePhysicalAssessmentBody = z.infer<
  typeof createPhysicalAssessmentBodySchema
>;

export const updatePhysicalAssessmentBodySchema = z.object({
  weightKg: requiredFloat.optional(),
  heightCm: requiredFloat.optional(),
  bodyFatPct: optionalFloat,
  muscleMassPct: optionalFloat,
  chestCm: optionalFloat,
  waistCm: optionalFloat,
  hipsCm: optionalFloat,
  leftArmCm: optionalFloat,
  rightArmCm: optionalFloat,
  leftThighCm: optionalFloat,
  rightThighCm: optionalFloat,
  notes: z.string().optional().nullable(),
});
export type UpdatePhysicalAssessmentBody = z.infer<
  typeof updatePhysicalAssessmentBodySchema
>;

export const physicalAssessmentResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  assessedBy: z.string().nullable(),
  weightKg: z.number(),
  heightCm: z.number(),
  bodyFatPct: z.number().nullable(),
  muscleMassPct: z.number().nullable(),
  chestCm: z.number().nullable(),
  waistCm: z.number().nullable(),
  hipsCm: z.number().nullable(),
  leftArmCm: z.number().nullable(),
  rightArmCm: z.number().nullable(),
  leftThighCm: z.number().nullable(),
  rightThighCm: z.number().nullable(),
  notes: z.string().nullable(),
  assessedAt: z.string(),
});
export type PhysicalAssessmentResponse = z.infer<
  typeof physicalAssessmentResponseSchema
>;

export const physicalAssessmentListResponseSchema = z.array(
  physicalAssessmentResponseSchema,
);
export const physicalAssessmentPaginatedResponseSchema =
  createPaginatedResponseSchema(physicalAssessmentResponseSchema);
