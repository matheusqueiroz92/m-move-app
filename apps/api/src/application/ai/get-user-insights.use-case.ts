import type { OpenAIInsightsProvider } from "../../domain/ai/providers/openai-provider.interface.js";

export class GetUserInsightsUseCase {
  constructor(private readonly insightsProvider: OpenAIInsightsProvider) {}

  async execute(input: { userId: string }): Promise<string> {
    return this.insightsProvider.getInsights(input.userId);
  }
}
