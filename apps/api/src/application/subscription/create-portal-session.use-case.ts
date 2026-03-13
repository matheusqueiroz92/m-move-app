import type { StripeProvider } from "../../domain/subscription/providers/stripe-provider.interface.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";

export interface CreatePortalSessionInput {
  userId: string;
  returnUrl: string;
}

export interface CreatePortalSessionResult {
  url: string;
}

export class CreatePortalSessionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(
    input: CreatePortalSessionInput,
  ): Promise<CreatePortalSessionResult> {
    const customerId =
      await this.userRepository.getStripeCustomerId(input.userId);
    if (!customerId) {
      throw new Error("User has no Stripe customer");
    }
    return this.stripeProvider.createBillingPortalSession({
      customerId,
      returnUrl: input.returnUrl,
    });
  }
}
