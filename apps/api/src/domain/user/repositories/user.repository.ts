export interface UserRepositoryFindByIdResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserSubscriptionInput {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  planType?: "STUDENT" | "PERSONAL" | "GYM" | null;
  subscriptionStatus?: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "UNPAID" | null;
}

export interface UserRepository {
  findById(userId: string): Promise<UserRepositoryFindByIdResult | null>;
  getStripeCustomerId(userId: string): Promise<string | null>;
  updateSubscriptionFields(
    userId: string,
    input: UpdateUserSubscriptionInput,
  ): Promise<void>;
}
