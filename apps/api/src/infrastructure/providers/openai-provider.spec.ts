import { beforeEach, describe, expect, it, vi } from "vitest";

import { OpenAIPlanProviderImpl } from "./openai-provider.js";

const mockChatCompletionsCreate = vi.hoisted(() => vi.fn());

const MockOpenAI = vi.hoisted(() =>
  vi.fn().mockImplementation(function (this: unknown) {
    return {
      chat: {
        completions: {
          create: mockChatCompletionsCreate,
        },
      },
    };
  }),
);

vi.mock("openai", () => ({ default: MockOpenAI }));

const mockEnv = vi.hoisted(() => ({
  OPENAI_API_KEY: "sk-fake-openai-key",
}));
vi.mock("../../lib/env.js", () => ({ env: mockEnv }));

const validPlanJson = JSON.stringify({
  name: "Test Plan",
  description: "A test plan",
  days: [
    {
      name: "Day A",
      isRest: false,
      weekDay: "MONDAY",
      estimatedDurationInSeconds: 3600,
      exercises: [
        {
          name: "Squat",
          order: 0,
          sets: 3,
          reps: 10,
          restTimeInSeconds: 60,
          description: null,
          notes: null,
        },
      ],
    },
  ],
});

describe("OpenAIPlanProviderImpl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.OPENAI_API_KEY = "sk-fake-openai-key";
  });

  describe("generateWorkoutPlan", () => {
    it("should throw when OPENAI_API_KEY is not set", async () => {
      mockEnv.OPENAI_API_KEY = undefined as unknown as string;
      const provider = new OpenAIPlanProviderImpl();
      await expect(
        provider.generateWorkoutPlan({
          userId: "user-1",
          objective: "Build muscle",
          level: "beginner",
          daysPerWeek: 3,
        }),
      ).rejects.toThrow("OPENAI_API_KEY is not configured");
    });

    it("should return validated plan when OpenAI returns valid JSON", async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [{ message: { content: validPlanJson } }],
      });
      const provider = new OpenAIPlanProviderImpl();
      const result = await provider.generateWorkoutPlan({
        userId: "user-1",
        objective: "Build muscle",
        level: "beginner",
        daysPerWeek: 3,
      });
      expect(result.name).toBe("Test Plan");
      expect(result.description).toBe("A test plan");
      expect(result.days).toHaveLength(1);
      const firstDay = result.days[0];
      expect(firstDay).toBeDefined();
      expect(firstDay!.name).toBe("Day A");
      expect(firstDay!.exercises[0]).toBeDefined();
      expect(firstDay!.exercises[0]!.name).toBe("Squat");
      expect(mockChatCompletionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4o",
          response_format: { type: "json_object" },
        }),
      );
    });

    it("should throw when OpenAI returns empty content", async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });
      const provider = new OpenAIPlanProviderImpl();
      await expect(
        provider.generateWorkoutPlan({
          userId: "user-1",
          objective: "Build muscle",
          level: "beginner",
          daysPerWeek: 3,
        }),
      ).rejects.toThrow("OpenAI returned empty response");
    });
  });

  describe("chat", () => {
    it("should throw when OPENAI_API_KEY is not set", async () => {
      mockEnv.OPENAI_API_KEY = undefined as unknown as string;
      const provider = new OpenAIPlanProviderImpl();
      await expect(
        provider.chat([{ role: "user", content: "Hello" }]),
      ).rejects.toThrow("OPENAI_API_KEY is not configured");
    });

    it("should return message content when OpenAI succeeds", async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [{ message: { content: "Hi there!" } }],
      });
      const provider = new OpenAIPlanProviderImpl();
      const result = await provider.chat([
        { role: "user", content: "Hello" },
      ]);
      expect(result).toBe("Hi there!");
    });

    it("should return empty string when content is null", async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });
      const provider = new OpenAIPlanProviderImpl();
      const result = await provider.chat([
        { role: "user", content: "Hello" },
      ]);
      expect(result).toBe("");
    });
  });

  describe("getInsights", () => {
    it("should throw when OPENAI_API_KEY is not set", async () => {
      mockEnv.OPENAI_API_KEY = undefined as unknown as string;
      const provider = new OpenAIPlanProviderImpl();
      await expect(provider.getInsights("user-1")).rejects.toThrow(
        "OPENAI_API_KEY is not configured",
      );
    });

    it("should return insights string when OpenAI succeeds", async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "Keep going! Log your workouts regularly.",
            },
          },
        ],
      });
      const provider = new OpenAIPlanProviderImpl();
      const result = await provider.getInsights("user-1");
      expect(result).toBe("Keep going! Log your workouts regularly.");
    });
  });
});
