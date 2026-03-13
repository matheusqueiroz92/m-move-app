import { describe, expect, it, vi } from "vitest";

import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";
import { ActivateWorkoutPlanUseCase } from "./activate-workout-plan.use-case.js";

describe("ActivateWorkoutPlanUseCase", () => {
  it("should deactivate other plans and activate the given plan", async () => {
    const activated: WorkoutPlanResult = {
      id: "plan-1",
      name: "Plano A",
      description: null,
      userId: "user-1",
      createdBy: "user-1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const findByIdAndUserId = vi
      .fn()
      .mockResolvedValue({ ...activated, isActive: false });
    const deactivateAllByUserId = vi.fn().mockResolvedValue(undefined);
    const updateIsActive = vi.fn().mockResolvedValue(activated);
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      findByIdAndUserId,
      deactivateAllByUserId,
      updateIsActive,
    };
    const useCase = new ActivateWorkoutPlanUseCase(repository);

    const result = await useCase.execute({
      planId: "plan-1",
      userId: "user-1",
    });

    expect(result).toEqual(activated);
    expect(findByIdAndUserId).toHaveBeenCalledWith("plan-1", "user-1");
    expect(deactivateAllByUserId).toHaveBeenCalledWith("user-1");
    expect(updateIsActive).toHaveBeenCalledWith("plan-1", "user-1", true);
  });

  it("should throw PlanNotFoundError when plan does not exist or belongs to another user", async () => {
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
    };
    const useCase = new ActivateWorkoutPlanUseCase(repository);

    await expect(
      useCase.execute({ planId: "other-plan", userId: "user-1" }),
    ).rejects.toThrow(PlanNotFoundError);
    await expect(
      useCase.execute({ planId: "other-plan", userId: "user-1" }),
    ).rejects.toThrow("Workout plan not found: other-plan");
  });
});
