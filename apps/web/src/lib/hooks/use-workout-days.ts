"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listWorkoutDays,
  createWorkoutDay,
  updateWorkoutDay,
  deleteWorkoutDay,
} from "@/lib/api/workout-plans";
import type {
  CreateWorkoutDayBody,
  UpdateWorkoutDayBody,
} from "@m-move-app/validators";

const PLANS_KEY = "workout-plans";

export function useWorkoutDays(planId: string | null) {
  return useQuery({
    queryKey: [PLANS_KEY, planId, "days"],
    queryFn: () => listWorkoutDays(planId!),
    enabled: !!planId,
  });
}

export function useCreateWorkoutDay(planId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkoutDayBody) => createWorkoutDay(planId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLANS_KEY, planId, "days"] });
      queryClient.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
  });
}

export function useUpdateWorkoutDay(planId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dayId,
      body,
    }: {
      dayId: string;
      body: UpdateWorkoutDayBody;
    }) => updateWorkoutDay(planId!, dayId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLANS_KEY, planId, "days"] });
    },
  });
}

export function useDeleteWorkoutDay(planId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayId: string) => deleteWorkoutDay(planId!, dayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLANS_KEY, planId, "days"] });
      queryClient.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
  });
}
