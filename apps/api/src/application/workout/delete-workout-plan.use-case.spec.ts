import { describe, expect, it, vi } from "vitest";

import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";
import { DeleteWorkoutPlanUseCase } from "./delete-workout-plan.use-case.js";

describe("DeleteWorkoutPlanUseCase", () => {
  it("should delete workout plan when plan belongs to user", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
      delete: vi.fn().mockResolvedValue(true),
    } as unknown as WorkoutPlanRepository;
    const useCase = new DeleteWorkoutPlanUseCase(planRepository);

    await useCase.execute({
      planId: "plan-1",
      userId: "user-1",
    });

    expect(planRepository.delete).toHaveBeenCalledWith("plan-1", "user-1");
  });

  it("should throw PlanNotFoundError when plan does not belong to user", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
    } as unknown as WorkoutPlanRepository;
    const useCase = new DeleteWorkoutPlanUseCase(planRepository);

    await expect(
      useCase.execute({
        planId: "plan-99",
        userId: "user-1",
      }),
    ).rejects.toThrow(PlanNotFoundError);
    expect(planRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw PlanNotFoundError when delete returns false", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
      delete: vi.fn().mockResolvedValue(false),
    } as unknown as WorkoutPlanRepository;
    const useCase = new DeleteWorkoutPlanUseCase(planRepository);

    await expect(
      useCase.execute({
        planId: "plan-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(PlanNotFoundError);
  });
});
