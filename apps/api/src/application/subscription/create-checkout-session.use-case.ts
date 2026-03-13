import type { StripeProvider } from "../../domain/subscription/providers/stripe-provider.interface.js";

export interface CreateCheckoutSessionInput {
  priceId: string;
  userId: string;
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResult {
  url: string;
  sessionId: string;
}

export class CreateCheckoutSessionUseCase {
  constructor(private readonly stripeProvider: StripeProvider) {}

  async execute(
    input: CreateCheckoutSessionInput,
  ): Promise<CreateCheckoutSessionResult> {
    return this.stripeProvider.createCheckoutSession({
      priceId: input.priceId,
      userId: input.userId,
      customerId: input.customerId,
      customerEmail: input.customerEmail,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
  }
}
