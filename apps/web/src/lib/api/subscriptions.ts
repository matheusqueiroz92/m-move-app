import { apiClient } from "./client";
import type { SubscriptionStatusResponse } from "@m-move-app/validators";

export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  const { data } = await apiClient.get<SubscriptionStatusResponse>(
    "/api/subscriptions/status",
  );
  return data;
}

export async function createPortalSession(
  returnUrl: string,
): Promise<{ url: string }> {
  const { data } = await apiClient.post<{ url: string }>(
    "/api/subscriptions/portal",
    { returnUrl },
  );
  return data;
}

export async function createCheckoutSession(params: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const { data } = await apiClient.post<{ url: string; sessionId: string }>(
    "/api/subscriptions/checkout",
    params,
  );
  return data;
}
