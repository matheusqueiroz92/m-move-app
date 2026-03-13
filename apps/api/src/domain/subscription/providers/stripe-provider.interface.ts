export interface CreateCheckoutSessionParams {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export interface CreatePortalSessionResult {
  url: string;
}

export interface StripeSubscriptionDetails {
  id: string;
  stripePriceId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
}

export interface StripeProvider {
  createCheckoutSession(
    params: CreateCheckoutSessionParams,
  ): Promise<CreateCheckoutSessionResult>;
  createBillingPortalSession(
    params: CreatePortalSessionParams,
  ): Promise<CreatePortalSessionResult>;
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): { type: string; data: { object: Record<string, unknown> } };
  getSubscriptionDetails(
    subscriptionId: string,
  ): Promise<StripeSubscriptionDetails | null>;
}
