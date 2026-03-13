import { describe, expect, it, vi } from "vitest";

import type {
  GeneratedWorkoutPlan,
  OpenAIPlanProvider,
} from "../../domain/ai/providers/openai-provider.interface.js";
import type {
  CreateWorkoutDayInput,
  WorkoutDayResult,
} from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type {
  CreateWorkoutExerciseInput,
  WorkoutExerciseResult,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutExerciseRepository } from "../../domain/workout/repositories/workout-exercise.repository.js";
import type {
  CreateWorkoutPlanInput,
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

    const dayResult: WorkoutDayResult = {
      id: "day-1",
      name: generated.days?.[0]?.name ?? "",
      workoutPlanId: planResult.id,
      isRest: false,
      weekDay: "MONDAY",
      estimatedDurationInSeconds: 3600,
      coverImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const exerciseResult: WorkoutExerciseResult = {
      id: "ex-1",
      name: "Supino Reto",
      order: 0,
      workoutDayId: dayResult.id,
      description: null,
      sets: 4,
      reps: 10,
      weightKg: null,
      restTimeInSeconds: 90,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const aiProvider: OpenAIPlanProvider = {
      generateWorkoutPlan: vi.fn().mockResolvedValue(generated),
    };

    const planRepo: WorkoutPlanRepository = {
      create: vi.fn().mockResolvedValue(planResult),
      findByUserId: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(planResult),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
    };

    const dayRepo: WorkoutDayRepository = {
      create: vi.fn().mockResolvedValue(dayResult),
      findById: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const exerciseRepo: WorkoutExerciseRepository = {
      create: vi.fn().mockResolvedValue(exerciseResult),
      findByDayId: vi.fn(),
      findByIdAndDayId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
    };

    const useCase = new GenerateWorkoutPlanWithAIUseCase(
      aiProvider,
      planRepo,
      dayRepo,
      exerciseRepo,
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

    expect(planRepo.create).toHaveBeenCalledWith({
      userId: "user-1",
      name: generated.name,
      description: generated.description,
      createdBy: null,
    } satisfies CreateWorkoutPlanInput);

    expect(dayRepo.create).toHaveBeenCalledWith({
      workoutPlanId: planResult.id,
      name: generated.days?.[0]?.name ?? "",
      isRest: false,
      weekDay: "MONDAY",
      estimatedDurationInSeconds: 3600,
    } satisfies CreateWorkoutDayInput);

    expect(exerciseRepo.create).toHaveBeenCalledWith({
      workoutDayId: dayResult.id,
      name: "Supino Reto",
      order: 0,
      sets: 4,
      reps: 10,
      restTimeInSeconds: 90,
      description: null,
      notes: null,
    } satisfies CreateWorkoutExerciseInput);

    expect(result.id).toBe(planResult.id);
    expect(result.name).toBe(planResult.name);
  });
});
