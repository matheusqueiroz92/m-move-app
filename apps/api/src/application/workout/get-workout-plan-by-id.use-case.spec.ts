import { describe, expect, it, vi } from "vitest";

import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plant.repository.js";
import { GetWorkoutPlanByIdUseCase } from "./get-workout-plan-by-id.use-case.js";

describe("GetWorkoutPlanByIdUseCase", () => {
  it("should return plan when it belongs to user", async () => {
    const plan: WorkoutPlanResult = {
      id: "plan-1",
      name: "Plano A",
      description: "Desc",
      userId: "user-1",
      createdBy: "user-1",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const findByIdAndUserId = vi.fn().mockResolvedValue(plan);
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      findByIdAndUserId,
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
    };
    const useCase = new GetWorkoutPlanByIdUseCase(repository);

    const result = await useCase.execute({
      planId: "plan-1",
      userId: "user-1",
    });

    expect(result).toEqual(plan);
    expect(findByIdAndUserId).toHaveBeenCalledWith("plan-1", "user-1");
  });

  it("should throw PlanNotFoundError when plan does not exist or belongs to another user", async () => {
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
    };
    const useCase = new GetWorkoutPlanByIdUseCase(repository);

    await expect(
      useCase.execute({ planId: "non-existent", userId: "user-1" }),
    ).rejects.toThrow(PlanNotFoundError);
    await expect(
      useCase.execute({ planId: "non-existent", userId: "user-1" }),
    ).rejects.toThrow("Workout plan not found: non-existent");
  });
});
