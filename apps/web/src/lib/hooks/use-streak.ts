"use client";

import { useQuery } from "@tanstack/react-query";
import { getStreak } from "@/lib/api/sessions";

export function useStreak(timezone?: string) {
  return useQuery({
    queryKey: ["streak", timezone],
    queryFn: () => getStreak(timezone),
  });
}
