"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listWorkoutPlans,
  getWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  activateWorkoutPlan,
} from "@/lib/api/workout-plans";
import type {
  CreateWorkoutPlanBody,
  UpdateWorkoutPlanBody,
} from "@m-move-app/validators";

const QUERY_KEY = "workout-plans";

export function useWorkoutPlans(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => listWorkoutPlans(params),
  });
}

export function useWorkoutPlan(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getWorkoutPlan(id!),
    enabled: !!id,
  });
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkoutPlanBody) => createWorkoutPlan(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateWorkoutPlanBody }) =>
      updateWorkoutPlan(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkoutPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useActivateWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateWorkoutPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
