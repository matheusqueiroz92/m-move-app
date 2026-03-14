import { describe, expect, it, vi } from "vitest";

import type {
  CreateWorkoutPlanInput,
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";
import { CreateWorkoutPlanUseCase } from "./create-workout-plan.use-case.js";

describe("CreateWorkoutPlanUseCase", () => {
  it("should create a workout plan and return the created plan", async () => {
    // Given: repository that returns the created plan
    const created: WorkoutPlanResult = {
      id: "plan-1",
      name: "Plano A",
      description: "Descrição do plano",
      userId: "user-1",
      createdBy: "user-1",
      isActive: false,
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    };
    const create = vi.fn().mockResolvedValue(created);
    const repository: WorkoutPlanRepository = {
      create,
      createWithDaysAndExercises: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
      findByIdAndUserId: vi.fn(),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser: vi.fn(),
    };
    const useCase = new CreateWorkoutPlanUseCase(repository);

    // When: creating a plan with userId and payload
    const input: CreateWorkoutPlanInput = {
      userId: "user-1",
      name: "Plano A",
      description: "Descrição do plano",
      createdBy: "user-1",
    };
    const result = await useCase.execute(input);

    // Then: returns the created plan
    expect(result).toEqual(created);
    expect(create).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Plano A",
      description: "Descrição do plano",
      createdBy: "user-1",
    });
  });

  it("should create a plan with optional description omitted", async () => {
    const created: WorkoutPlanResult = {
      id: "plan-2",
      name: "Plano B",
      description: null,
      userId: "user-1",
      createdBy: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const create = vi.fn().mockResolvedValue(created);
    const repository: WorkoutPlanRepository = {
      create,
      createWithDaysAndExercises: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
      findByIdAndUserId: vi.fn(),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser: vi.fn(),
    };
    const useCase = new CreateWorkoutPlanUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      name: "Plano B",
    });

    expect(result).toEqual(created);
    expect(create).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Plano B",
      description: undefined,
      createdBy: undefined,
    });
  });
});
