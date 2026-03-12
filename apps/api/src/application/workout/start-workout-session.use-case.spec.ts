import { describe, expect, it, vi } from "vitest";

import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type { WorkoutSessionResult } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";
import { StartWorkoutSessionUseCase } from "./start-workout-session.use-case.js";

describe("StartWorkoutSessionUseCase", () => {
  it("should create session when day belongs to user plan", async () => {
    const created: WorkoutSessionResult = {
      id: "sess-1",
      userId: "user-1",
      workoutDayId: "day-1",
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "day-1",
        workoutPlanId: "plan-1",
      }),
      create: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn().mockResolvedValue(created),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn(),
    };
    const useCase = new StartWorkoutSessionUseCase(
      planRepository,
      dayRepository,
      sessionRepository,
    );

    const result = await useCase.execute({
      userId: "user-1",
      workoutDayId: "day-1",
    });

    expect(result).toEqual(created);
    expect(sessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        workoutDayId: "day-1",
      }),
    );
  });

  it("should throw DayNotFoundError when day does not exist or plan not owned by user", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
    } as unknown as WorkoutPlanRepository;
    const dayRepository: WorkoutDayRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "day-1",
        workoutPlanId: "plan-1",
      }),
      create: vi.fn(),
      findByPlanId: vi.fn(),
      findByIdAndPlanId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn(),
    };
    const useCase = new StartWorkoutSessionUseCase(
      planRepository,
      dayRepository,
      sessionRepository,
    );

    await expect(
      useCase.execute({ userId: "user-1", workoutDayId: "day-1" }),
    ).rejects.toThrow(DayNotFoundError);
    expect(sessionRepository.create).not.toHaveBeenCalled();
  });
});
