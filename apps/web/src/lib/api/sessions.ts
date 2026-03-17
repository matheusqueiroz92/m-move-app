import type { WorkoutSessionResponse } from "@m-move-app/validators";
import { apiClient } from "./client";

export interface StreakResponse {
  streak: number;
}

export async function getStreak(timezone?: string): Promise<StreakResponse> {
  const { data } = await apiClient.get<StreakResponse>("/api/sessions/streak", {
    params: timezone ? { timezone } : undefined,
  });
  return data;
}

export async function getSessionHistory(params?: {
  limit?: number;
  offset?: number;
}): Promise<WorkoutSessionResponse[]> {
  const { data } = await apiClient.get<WorkoutSessionResponse[]>(
    "/api/sessions/history",
    { params },
  );
  return data;
}

export async function startSession(
  workoutDayId: string,
): Promise<WorkoutSessionResponse> {
  const { data } = await apiClient.post<WorkoutSessionResponse>(
    "/api/sessions/start",
    { workoutDayId },
  );
  return data;
}

export async function completeSession(
  sessionId: string,
): Promise<WorkoutSessionResponse> {
  const { data } = await apiClient.patch<WorkoutSessionResponse>(
    `/api/sessions/${sessionId}/complete`,
  );
  return data;
}
