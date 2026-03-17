import type {
  WorkoutDayResponse,
  WorkoutExerciseResponse,
  WorkoutPlanResponse,
} from "@m-move-app/types";
import type {
  CreateWorkoutDayBody,
  CreateWorkoutExerciseBody,
  CreateWorkoutPlanBody,
  PaginatedResponse,
  UpdateWorkoutDayBody,
  UpdateWorkoutExerciseBody,
  UpdateWorkoutPlanBody,
} from "@m-move-app/validators";
import { apiClient } from "./client";

export async function listWorkoutPlans(params?: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<WorkoutPlanResponse>> {
  const { data } = await apiClient.get<PaginatedResponse<WorkoutPlanResponse>>(
    "/api/workout-plans",
    { params },
  );
  return data;
}

export async function getWorkoutPlan(id: string): Promise<WorkoutPlanResponse> {
  const { data } = await apiClient.get<WorkoutPlanResponse>(
    `/api/workout-plans/${id}`,
  );
  return data;
}

export async function createWorkoutPlan(
  body: CreateWorkoutPlanBody,
): Promise<WorkoutPlanResponse> {
  const { data } = await apiClient.post<WorkoutPlanResponse>(
    "/api/workout-plans",
    body,
  );
  return data;
}

export async function updateWorkoutPlan(
  id: string,
  body: UpdateWorkoutPlanBody,
): Promise<WorkoutPlanResponse> {
  const { data } = await apiClient.patch<WorkoutPlanResponse>(
    `/api/workout-plans/${id}`,
    body,
  );
  return data;
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  await apiClient.delete(`/api/workout-plans/${id}`);
}

export async function activateWorkoutPlan(
  id: string,
): Promise<WorkoutPlanResponse> {
  const { data } = await apiClient.post<WorkoutPlanResponse>(
    `/api/workout-plans/${id}/activate`,
  );
  return data;
}

export async function listWorkoutDays(
  planId: string,
): Promise<WorkoutDayResponse[]> {
  const { data } = await apiClient.get<WorkoutDayResponse[]>(
    `/api/workout-plans/${planId}/days`,
  );
  return data;
}

export async function createWorkoutDay(
  planId: string,
  body: CreateWorkoutDayBody,
): Promise<WorkoutDayResponse> {
  const { data } = await apiClient.post<WorkoutDayResponse>(
    `/api/workout-plans/${planId}/days`,
    body,
  );
  return data;
}

export async function updateWorkoutDay(
  planId: string,
  dayId: string,
  body: UpdateWorkoutDayBody,
): Promise<WorkoutDayResponse> {
  const { data } = await apiClient.patch<WorkoutDayResponse>(
    `/api/workout-plans/${planId}/days/${dayId}`,
    body,
  );
  return data;
}

export async function deleteWorkoutDay(
  planId: string,
  dayId: string,
): Promise<void> {
  await apiClient.delete(`/api/workout-plans/${planId}/days/${dayId}`);
}

export async function listExercises(
  dayId: string,
): Promise<WorkoutExerciseResponse[]> {
  const { data } = await apiClient.get<WorkoutExerciseResponse[]>(
    `/api/workout-days/${dayId}/exercises`,
  );
  return data;
}

export async function createExercise(
  dayId: string,
  body: CreateWorkoutExerciseBody,
): Promise<WorkoutExerciseResponse> {
  const { data } = await apiClient.post<WorkoutExerciseResponse>(
    `/api/workout-days/${dayId}/exercises`,
    body,
  );
  return data;
}

export async function updateExercise(
  dayId: string,
  exerciseId: string,
  body: UpdateWorkoutExerciseBody,
): Promise<WorkoutExerciseResponse> {
  const { data } = await apiClient.patch<WorkoutExerciseResponse>(
    `/api/workout-days/${dayId}/exercises/${exerciseId}`,
    body,
  );
  return data;
}

export async function deleteExercise(
  dayId: string,
  exerciseId: string,
): Promise<void> {
  await apiClient.delete(`/api/workout-days/${dayId}/exercises/${exerciseId}`);
}

export async function reorderExercises(
  dayId: string,
  exerciseIdsInOrder: string[],
): Promise<void> {
  await apiClient.patch(`/api/workout-days/${dayId}/exercises/reorder`, {
    exerciseIdsInOrder,
  });
}
