import { apiClient } from "./client";

export async function acceptGymInvite(token: string): Promise<void> {
  await apiClient.post("/api/gym/accept-invite", { token });
}
