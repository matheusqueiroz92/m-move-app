export type PlanType = "STUDENT" | "PERSONAL" | "GYM";
export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID";

export interface CreateSubscriptionInput {
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date | null;
}

export interface SubscriptionResult {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSubscriptionInput {
  stripePriceId?: string;
  planType?: PlanType;
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date | null;
}

import type { TransactionClient } from "../../database/transaction-client.js";

export interface SubscriptionRepository {
  create(
    input: CreateSubscriptionInput,
    tx?: TransactionClient,
  ): Promise<SubscriptionResult>;
  findByUserId(userId: string): Promise<SubscriptionResult | null>;
  findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionResult | null>;
  update(
    id: string,
    input: UpdateSubscriptionInput,
    tx?: TransactionClient,
  ): Promise<SubscriptionResult | null>;
}
