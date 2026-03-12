import { describe, expect, it, vi } from "vitest";

import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutDayRepository,
  WorkoutDayResult,
} from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";
import { ListWorkoutDaysUseCase } from "./list-workout-days.use-case.js";

describe("ListWorkoutDaysUseCase", () => {
  it("should return days when plan belongs to user", async () => {
    const days: WorkoutDayResult[] = [
      {
        id: "day-1",
        name: "Dia A",
        workoutPlanId: "plan-1",
        isRest: false,
        weekDay: "MONDAY",
        estimatedDurationInSeconds: 3600,
        coverImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findByPlanId: vi.fn().mockResolvedValue(days),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListWorkoutDaysUseCase(planRepository, dayRepository);

    const result = await useCase.execute({ planId: "plan-1", userId: "user-1" });

    expect(result).toEqual(days);
    expect(dayRepository.findByPlanId).toHaveBeenCalledWith("plan-1");
  });

  it("should throw PlanNotFoundError when plan does not belong to user", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListWorkoutDaysUseCase(planRepository, dayRepository);

    await expect(
      useCase.execute({ planId: "other-plan", userId: "user-1" }),
    ).rejects.toThrow(PlanNotFoundError);
    expect(dayRepository.findByPlanId).not.toHaveBeenCalled();
  });
});
