import { describe, expect, it, vi } from "vitest";

import { CannotDeleteLastDayError } from "../../domain/workout/errors/cannot-delete-last-day.error.js";
import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";
import { DeleteWorkoutDayUseCase } from "./delete-workout-day.use-case.js";

describe("DeleteWorkoutDayUseCase", () => {
  it("should delete workout day when plan has more than one day (RF-006)", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPlanId: vi
        .fn()
        .mockResolvedValue([{ id: "day-1" }, { id: "day-2" }]),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
    };
    const useCase = new DeleteWorkoutDayUseCase(planRepository, dayRepository);

    await useCase.execute({
      planId: "plan-1",
      dayId: "day-1",
      userId: "user-1",
    });

    expect(dayRepository.delete).toHaveBeenCalledWith("day-1", "plan-1");
  });

  it("should throw CannotDeleteLastDayError when plan has only one day (RF-006)", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPlanId: vi.fn().mockResolvedValue([{ id: "day-1" }]),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new DeleteWorkoutDayUseCase(planRepository, dayRepository);

    await expect(
      useCase.execute({
        planId: "plan-1",
        dayId: "day-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(CannotDeleteLastDayError);
    expect(dayRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw PlanNotFoundError when plan does not belong to user", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new DeleteWorkoutDayUseCase(planRepository, dayRepository);

    await expect(
      useCase.execute({
        planId: "plan-1",
        dayId: "day-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(PlanNotFoundError);
    expect(dayRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw DayNotFoundError when day does not exist or does not belong to plan", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPlanId: vi
        .fn()
        .mockResolvedValue([{ id: "day-1" }, { id: "day-99" }]),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(false),
    };
    const useCase = new DeleteWorkoutDayUseCase(planRepository, dayRepository);

    await expect(
      useCase.execute({
        planId: "plan-1",
        dayId: "day-99",
        userId: "user-1",
      }),
    ).rejects.toThrow(DayNotFoundError);
  });
});
