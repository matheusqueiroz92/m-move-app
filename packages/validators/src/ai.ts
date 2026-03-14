import { WEEK_DAYS } from "@m-move-app/constants";
import { z } from "zod";

import { createPaginatedResponseSchema } from "./pagination.js";

const weekDaySchema = z.enum(WEEK_DAYS);

export const generatedWorkoutExerciseSchema = z.object({
  name: z.string(),
  order: z.number().int().min(0),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  restTimeInSeconds: z.number().int().min(0),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const generatedWorkoutDaySchema = z.object({
  name: z.string(),
  isRest: z.boolean(),
  weekDay: weekDaySchema,
  estimatedDurationInSeconds: z.number().int().min(0).nullable().optional(),
  exercises: z.array(generatedWorkoutExerciseSchema),
});

export const generatedWorkoutPlanSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  days: z.array(generatedWorkoutDaySchema),
});

export type GeneratedWorkoutPlanSchema = z.infer<
  typeof generatedWorkoutPlanSchema
>;

export const generateWorkoutPlanBodySchema = z.object({
  objective: z.string().min(1, "Objective is required"),
  level: z.string().min(1, "Level is required"),
  daysPerWeek: z.number().int().min(1).max(7),
  equipment: z.array(z.string()).optional().default([]),
  restrictions: z.string().optional(),
});
export type GenerateWorkoutPlanBody = z.infer<
  typeof generateWorkoutPlanBodySchema
>;

export const generateWorkoutPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});
export type GenerateWorkoutPlanResponse = z.infer<
  typeof generateWorkoutPlanResponseSchema
>;

export const sendChatMessageBodySchema = z.object({
  chatId: z.string().uuid().nullable().optional(),
  content: z.string().min(1, "Content is required"),
});
export type SendChatMessageBody = z.infer<typeof sendChatMessageBodySchema>;

export const chatResponseSchema = z.object({
  chatId: z.string(),
  content: z.string(),
});
export const aiChatResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const aiChatListResponseSchema = z.array(aiChatResponseSchema);
export const aiChatPaginatedResponseSchema =
  createPaginatedResponseSchema(aiChatResponseSchema);

export const insightsResponseSchema = z.object({
  insights: z.string(),
});
