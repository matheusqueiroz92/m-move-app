import { describe, expect, it, vi } from "vitest";

import type {
  GeneratedWorkoutPlan,
  OpenAIPlanProvider,
} from "../../domain/ai/providers/openai-provider.interface.js";
import type {
  CreateWorkoutPlanFullInput,
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";
import { GenerateWorkoutPlanWithAIUseCase } from "./generate-workout-plan-with-ai.use-case.js";

describe("GenerateWorkoutPlanWithAIUseCase", () => {
  it("should create plan, days and exercises from AI-generated structure", async () => {
    const generated: GeneratedWorkoutPlan = {
      name: "Plano Hipertrofia",
      description: "Foco em ganho de massa",
      days: [
        {
          name: "Peito e Tríceps",
          isRest: false,
          weekDay: "MONDAY",
          estimatedDurationInSeconds: 3600,
          exercises: [
            {
              name: "Supino Reto",
              order: 0,
              sets: 4,
              reps: 10,
              restTimeInSeconds: 90,
              description: null,
              notes: null,
            },
          ],
        },
      ],
    };

    const planResult: WorkoutPlanResult = {
      id: "plan-1",
      name: generated.name,
      description: generated.description,
      userId: "user-1",
      createdBy: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const aiProvider: OpenAIPlanProvider = {
      generateWorkoutPlan: vi.fn().mockResolvedValue(generated),
    };

    const planRepo: WorkoutPlanRepository = {
      create: vi.fn(),
      createWithDaysAndExercises: vi.fn().mockResolvedValue(planResult),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
      findByIdAndUserId: vi.fn(),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GenerateWorkoutPlanWithAIUseCase(
      aiProvider,
      planRepo,
    );

    const result = await useCase.execute({
      userId: "user-1",
      objective: "Hipertrofia",
      level: "Intermediário",
      daysPerWeek: 4,
      equipment: ["halteres", "barra"],
    });

    expect(aiProvider.generateWorkoutPlan).toHaveBeenCalledWith({
      userId: "user-1",
      objective: "Hipertrofia",
      level: "Intermediário",
      daysPerWeek: 4,
      equipment: ["halteres", "barra"],
    });

    expect(planRepo.createWithDaysAndExercises).toHaveBeenCalledWith({
      userId: "user-1",
      name: generated.name,
      description: generated.description,
      createdBy: null,
      days: [
        {
          name: "Peito e Tríceps",
          isRest: false,
          weekDay: "MONDAY",
          estimatedDurationInSeconds: 3600,
          exercises: [
            {
              name: "Supino Reto",
              order: 0,
              sets: 4,
              reps: 10,
              restTimeInSeconds: 90,
              description: null,
              notes: null,
            },
          ],
        },
      ],
    } satisfies CreateWorkoutPlanFullInput);

    expect(result.id).toBe(planResult.id);
    expect(result.name).toBe(planResult.name);
  });
});
