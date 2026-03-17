"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessionHistory } from "@/lib/api/sessions";

export function useSessionHistory(params?: {
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["session-history", params],
    queryFn: () => getSessionHistory(params),
  });
}
