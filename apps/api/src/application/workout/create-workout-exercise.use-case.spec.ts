import { describe, expect, it, vi } from "vitest";

import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type {
  WorkoutExerciseRepository,
  WorkoutExerciseResult,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";
import { CreateWorkoutExerciseUseCase } from "./create-workout-exercise.use-case.js";

describe("CreateWorkoutExerciseUseCase", () => {
  it("should create exercise when day belongs to user plan", async () => {
    const created: WorkoutExerciseResult = {
      id: "ex-1",
      name: "Supino",
      order: 0,
      workoutDayId: "day-1",
      description: null,
      sets: 3,
      reps: 10,
      weightKg: null,
      restTimeInSeconds: 60,
      notes: null,
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
    const exerciseRepository: WorkoutExerciseRepository = {
      create: vi.fn().mockResolvedValue(created),
      findByDayId: vi.fn(),
      findByIdAndDayId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
    };
    const useCase = new CreateWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    const result = await useCase.execute({
      dayId: "day-1",
      userId: "user-1",
      name: "Supino",
      order: 0,
      sets: 3,
      reps: 10,
      restTimeInSeconds: 60,
    });

    expect(result).toEqual(created);
    expect(exerciseRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workoutDayId: "day-1",
        name: "Supino",
        order: 0,
        sets: 3,
        reps: 10,
        restTimeInSeconds: 60,
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
    const exerciseRepository: WorkoutExerciseRepository = {
      create: vi.fn(),
      findByDayId: vi.fn(),
      findByIdAndDayId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
    };
    const useCase = new CreateWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    await expect(
      useCase.execute({
        dayId: "day-1",
        userId: "user-1",
        name: "Supino",
        order: 0,
        sets: 3,
        reps: 10,
        restTimeInSeconds: 60,
      }),
    ).rejects.toThrow(DayNotFoundError);
    expect(exerciseRepository.create).not.toHaveBeenCalled();
  });
});
