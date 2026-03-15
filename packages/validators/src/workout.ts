import { z } from "zod";

import { WEEK_DAYS } from "@m-move-app/constants";

import { createPaginatedResponseSchema } from "./pagination.js";

const weekDaySchema = z.enum(WEEK_DAYS);

export const createWorkoutPlanBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
});
export type CreateWorkoutPlanBody = z.infer<typeof createWorkoutPlanBodySchema>;

export const updateWorkoutPlanBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
});
export type UpdateWorkoutPlanBody = z.infer<typeof updateWorkoutPlanBodySchema>;

export const workoutPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.string(),
  createdBy: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkoutPlanResponse = z.infer<typeof workoutPlanResponseSchema>;

export const workoutPlanListResponseSchema = z.array(workoutPlanResponseSchema);
export const workoutPlanPaginatedResponseSchema =
  createPaginatedResponseSchema(workoutPlanResponseSchema);

export const createWorkoutDayBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  isRest: z.boolean().optional().default(false),
  weekDay: weekDaySchema,
  estimatedDurationInSeconds: z.number().int().min(0).optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
});
export type CreateWorkoutDayBody = z.infer<typeof createWorkoutDayBodySchema>;

export const workoutDayResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  workoutPlanId: z.string(),
  isRest: z.boolean(),
  weekDay: z.string(),
  estimatedDurationInSeconds: z.number().nullable(),
  coverImageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkoutDayResponse = z.infer<typeof workoutDayResponseSchema>;

export const workoutDayListResponseSchema = z.array(workoutDayResponseSchema);

export const updateWorkoutDayBodySchema = z.object({
  name: z.string().min(1).optional(),
  isRest: z.boolean().optional(),
  weekDay: weekDaySchema.optional(),
  estimatedDurationInSeconds: z.number().int().min(0).optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
});
export type UpdateWorkoutDayBody = z.infer<typeof updateWorkoutDayBodySchema>;

export const createWorkoutExerciseBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  order: z.number().int().min(0),
  description: z.string().optional().nullable(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  weightKg: z.number().min(0).optional().nullable(),
  restTimeInSeconds: z.number().int().min(0),
  notes: z.string().optional().nullable(),
});
export type CreateWorkoutExerciseBody = z.infer<
  typeof createWorkoutExerciseBodySchema
>;

export const updateWorkoutExerciseBodySchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  description: z.string().optional().nullable(),
  sets: z.number().int().min(1).optional(),
  reps: z.number().int().min(1).optional(),
  weightKg: z.number().min(0).optional().nullable(),
  restTimeInSeconds: z.number().int().min(0).optional(),
  notes: z.string().optional().nullable(),
});
export type UpdateWorkoutExerciseBody = z.infer<
  typeof updateWorkoutExerciseBodySchema
>;

export const reorderExercisesBodySchema = z.object({
  exerciseIdsInOrder: z.array(z.string().min(1)).min(1),
});
export type ReorderExercisesBody = z.infer<typeof reorderExercisesBodySchema>;

export const workoutExerciseResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
  workoutDayId: z.string(),
  description: z.string().nullable(),
  sets: z.number(),
  reps: z.number(),
  weightKg: z.number().nullable(),
  restTimeInSeconds: z.number(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkoutExerciseResponse = z.infer<
  typeof workoutExerciseResponseSchema
>;

export const workoutExerciseListResponseSchema = z.array(
  workoutExerciseResponseSchema,
);

// --- Session ---
export const startSessionBodySchema = z.object({
  workoutDayId: z.string().min(1, "workoutDayId is required"),
});
export type StartSessionBody = z.infer<typeof startSessionBodySchema>;

export const workoutSessionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workoutDayId: z.string(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkoutSessionResponse = z.infer<
  typeof workoutSessionResponseSchema
>;

export const workoutSessionListResponseSchema = z.array(
  workoutSessionResponseSchema,
);

export const streakResponseSchema = z.object({
  streak: z.number(),
});
