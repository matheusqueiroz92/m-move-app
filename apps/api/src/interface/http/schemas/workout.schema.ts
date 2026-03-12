import { z } from "zod";

export const createWorkoutPlanBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
});

export type CreateWorkoutPlanBody = z.infer<typeof createWorkoutPlanBodySchema>;

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

const weekDaySchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

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
