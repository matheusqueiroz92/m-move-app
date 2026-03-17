import type { UserProfile } from "@m-move-app/types";
import { apiClient } from "./client";

export async function getMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>("/api/users/me");
  return data;
}
