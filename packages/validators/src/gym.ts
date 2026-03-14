import { z } from "zod";

import { createPaginatedResponseSchema } from "./pagination.js";

export const createGymBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  maxInstructors: z.number().int().min(1).max(100).optional(),
  maxStudents: z.number().int().min(1).max(1000).optional(),
});
export type CreateGymBody = z.infer<typeof createGymBodySchema>;

export const updateGymBodySchema = z.object({
  name: z.string().min(1).optional(),
  maxInstructors: z.number().int().min(1).max(100).optional(),
  maxStudents: z.number().int().min(1).max(1000).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateGymBody = z.infer<typeof updateGymBodySchema>;

export const gymResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  maxInstructors: z.number(),
  maxStudents: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GymResponse = z.infer<typeof gymResponseSchema>;

export const inviteInstructorBodySchema = z.object({
  inviteEmail: z.string().email("Invalid email"),
});
export type InviteInstructorBody = z.infer<typeof inviteInstructorBodySchema>;

const linkStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
]);

export const gymInstructorResponseSchema = z.object({
  id: z.string(),
  gymId: z.string(),
  instructorId: z.string().nullable(),
  inviteEmail: z.string(),
  inviteToken: z.string(),
  inviteExpiresAt: z.string(),
  status: linkStatusSchema,
  acceptedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type GymInstructorResponse = z.infer<
  typeof gymInstructorResponseSchema
>;

export const gymInstructorListResponseSchema = z.array(
  gymInstructorResponseSchema,
);
export const gymInstructorPaginatedResponseSchema =
  createPaginatedResponseSchema(gymInstructorResponseSchema);
