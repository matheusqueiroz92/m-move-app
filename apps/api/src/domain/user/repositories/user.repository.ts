export interface UserRepositoryFindByIdResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserRepositoryFindByIdWithPlanResult {
  planType: "STUDENT" | "PERSONAL" | "GYM" | null;
  timezone: string | null;
}

export interface UpdateUserSubscriptionInput {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  planType?: "STUDENT" | "PERSONAL" | "GYM" | null;
  subscriptionStatus?: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "UNPAID" | null;
}

import type { TransactionClient } from "../../database/transaction-client.js";

export interface UserRepository {
  findById(userId: string): Promise<UserRepositoryFindByIdResult | null>;
  findByIdWithPlanAndTimezone(
    userId: string,
  ): Promise<UserRepositoryFindByIdWithPlanResult | null>;
  getStripeCustomerId(userId: string): Promise<string | null>;
  updateSubscriptionFields(
    userId: string,
    input: UpdateUserSubscriptionInput,
    tx?: TransactionClient,
  ): Promise<void>;
}
