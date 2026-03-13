import { describe, expect, it, vi } from "vitest";

import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutDayRepository,
  WorkoutDayResult,
} from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";
import { UpdateWorkoutDayUseCase } from "./update-workout-day.use-case.js";

describe("UpdateWorkoutDayUseCase", () => {
  it("should update workout day when plan and day belong to user", async () => {
    const updated: WorkoutDayResult = {
      id: "day-1",
      name: "Dia Atualizado",
      workoutPlanId: "plan-1",
      isRest: true,
      weekDay: "TUESDAY",
      estimatedDurationInSeconds: 1800,
      coverImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn().mockResolvedValue(updated),
      delete: vi.fn(),
    };
    const useCase = new UpdateWorkoutDayUseCase(planRepository, dayRepository);

    const result = await useCase.execute({
      planId: "plan-1",
      dayId: "day-1",
      userId: "user-1",
      name: "Dia Atualizado",
      isRest: true,
      weekDay: "TUESDAY",
      estimatedDurationInSeconds: 1800,
    });

    expect(result).toEqual(updated);
    expect(dayRepository.update).toHaveBeenCalledWith(
      "day-1",
      "plan-1",
      expect.objectContaining({
        name: "Dia Atualizado",
        isRest: true,
        weekDay: "TUESDAY",
        estimatedDurationInSeconds: 1800,
      }),
    );
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
    const useCase = new UpdateWorkoutDayUseCase(planRepository, dayRepository);

    await expect(
      useCase.execute({
        planId: "plan-1",
        dayId: "day-1",
        userId: "user-1",
        name: "Novo Nome",
      }),
    ).rejects.toThrow(PlanNotFoundError);
    expect(dayRepository.update).not.toHaveBeenCalled();
  });

  it("should throw DayNotFoundError when day does not exist or does not belong to plan", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
    };
    const useCase = new UpdateWorkoutDayUseCase(planRepository, dayRepository);

    await expect(
      useCase.execute({
        planId: "plan-1",
        dayId: "day-99",
        userId: "user-1",
        name: "Novo Nome",
      }),
    ).rejects.toThrow(DayNotFoundError);
  });
});
