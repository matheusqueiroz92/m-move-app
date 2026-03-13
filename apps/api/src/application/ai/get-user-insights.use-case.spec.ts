import { describe, expect, it, vi } from "vitest";

import type { OpenAIInsightsProvider } from "../../domain/ai/providers/openai-provider.interface.js";
import { GetUserInsightsUseCase } from "./get-user-insights.use-case.js";

describe("GetUserInsightsUseCase", () => {
  it("should return insights from provider", async () => {
    const provider: OpenAIInsightsProvider = {
      getInsights: vi.fn().mockResolvedValue("Você está evoluindo bem. Recomendo aumentar carga."),
    };
    const useCase = new GetUserInsightsUseCase(provider);
    const result = await useCase.execute({ userId: "user-1" });
    expect(provider.getInsights).toHaveBeenCalledWith("user-1");
    expect(result).toBe("Você está evoluindo bem. Recomendo aumentar carga.");
  });
});
