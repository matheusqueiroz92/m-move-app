import { describe, expect, it, vi } from "vitest";

import { PlanMustHaveAtLeastOneDayError } from "../../domain/workout/errors/plan-must-have-at-least-one-day.error.js";
import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";
import { ActivateWorkoutPlanUseCase } from "./activate-workout-plan.use-case.js";

const mockDayRepository: WorkoutDayRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByPlanId: vi.fn(),
  findByIdAndPlanId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe("ActivateWorkoutPlanUseCase", () => {
  it("should deactivate other plans and activate the given plan when plan has at least one day (RF-006)", async () => {
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
    const activatePlanForUser = vi.fn().mockResolvedValue(activated);
    const planRepository: WorkoutPlanRepository = {
      create: vi.fn(),
      createWithDaysAndExercises: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
      findAssignedPlansByUserIdPaginated: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(activated),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser,
      reassignCreatedBy: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const dayRepository: WorkoutDayRepository = {
      ...mockDayRepository,
      findByPlanId: vi.fn().mockResolvedValue([{ id: "day-1" }]),
    };
    const useCase = new ActivateWorkoutPlanUseCase(
      planRepository,
      dayRepository,
    );

    const result = await useCase.execute({
      planId: "plan-1",
      userId: "user-1",
    });

    expect(result).toEqual(activated);
    expect(activatePlanForUser).toHaveBeenCalledWith("plan-1", "user-1");
  });

  it("should throw PlanMustHaveAtLeastOneDayError when plan has no days (RF-006)", async () => {
    const planRepository: WorkoutPlanRepository = {
      create: vi.fn(),
      createWithDaysAndExercises: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
      findAssignedPlansByUserIdPaginated: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue({
        id: "plan-1",
        name: "Empty",
        userId: "user-1",
      }),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser: vi.fn(),
      reassignCreatedBy: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const dayRepository: WorkoutDayRepository = {
      ...mockDayRepository,
      findByPlanId: vi.fn().mockResolvedValue([]),
    };
    const useCase = new ActivateWorkoutPlanUseCase(
      planRepository,
      dayRepository,
    );

    await expect(
      useCase.execute({ planId: "plan-1", userId: "user-1" }),
    ).rejects.toThrow(PlanMustHaveAtLeastOneDayError);
    await expect(
      useCase.execute({ planId: "plan-1", userId: "user-1" }),
    ).rejects.toThrow("at least one day");
  });

  it("should throw PlanNotFoundError when plan does not exist or belongs to another user", async () => {
    const planRepository: WorkoutPlanRepository = {
      create: vi.fn(),
      createWithDaysAndExercises: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn(),
      findAssignedPlansByUserIdPaginated: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser: vi.fn().mockResolvedValue(null),
      reassignCreatedBy: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ActivateWorkoutPlanUseCase(
      planRepository,
      mockDayRepository,
    );

    await expect(
      useCase.execute({ planId: "other-plan", userId: "user-1" }),
    ).rejects.toThrow(PlanNotFoundError);
    await expect(
      useCase.execute({ planId: "other-plan", userId: "user-1" }),
    ).rejects.toThrow("Workout plan not found: other-plan");
  });
});
