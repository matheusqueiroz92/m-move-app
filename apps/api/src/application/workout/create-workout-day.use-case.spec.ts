import { describe, expect, it, vi } from "vitest";

import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  CreateWorkoutDayInput,
  WorkoutDayRepository,
  WorkoutDayResult,
} from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";
import { CreateWorkoutDayUseCase } from "./create-workout-day.use-case.js";

describe("CreateWorkoutDayUseCase", () => {
  it("should create a workout day when plan belongs to user", async () => {
    const created: WorkoutDayResult = {
      id: "day-1",
      name: "Dia A",
      workoutPlanId: "plan-1",
      isRest: false,
      weekDay: "MONDAY",
      estimatedDurationInSeconds: 3600,
      coverImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1", userId: "user-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      create: vi.fn().mockResolvedValue(created),
      findById: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new CreateWorkoutDayUseCase(planRepository, dayRepository);

    const result = await useCase.execute({
      planId: "plan-1",
      userId: "user-1",
      name: "Dia A",
      weekDay: "MONDAY",
      estimatedDurationInSeconds: 3600,
    });

    expect(result).toEqual(created);
    expect(dayRepository.create).toHaveBeenCalledWith({
      workoutPlanId: "plan-1",
      name: "Dia A",
      isRest: undefined,
      weekDay: "MONDAY",
      estimatedDurationInSeconds: 3600,
      coverImageUrl: undefined,
    });
  });

  it("should throw PlanNotFoundError when plan does not exist or does not belong to user", async () => {
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
    const useCase = new CreateWorkoutDayUseCase(planRepository, dayRepository);

    await expect(
      useCase.execute({
        planId: "other-plan",
        userId: "user-1",
        name: "Dia X",
        weekDay: "TUESDAY",
      }),
    ).rejects.toThrow(PlanNotFoundError);
    expect(dayRepository.create).not.toHaveBeenCalled();
  });
});
