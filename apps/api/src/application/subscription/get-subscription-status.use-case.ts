import type {
  SubscriptionRepository,
  SubscriptionResult,
} from "../../domain/subscription/repositories/subscription.repository.js";

export interface GetSubscriptionStatusInput {
  userId: string;
}

export class GetSubscriptionStatusUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(
    input: GetSubscriptionStatusInput,
  ): Promise<SubscriptionResult | null> {
    return this.subscriptionRepository.findByUserId(input.userId);
  }
}
