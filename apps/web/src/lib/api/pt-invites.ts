import { apiClient } from "./client";

export async function acceptPtInvite(token: string): Promise<void> {
  await apiClient.post("/api/pt/invites/accept", { token });
}
