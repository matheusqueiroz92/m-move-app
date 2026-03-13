import { describe, expect, it, vi } from "vitest";

import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import type {
  WorkoutExerciseRepository,
  WorkoutExerciseResult,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";
import { ReorderWorkoutExercisesUseCase } from "./reorder-workout-exercises.use-case.js";

describe("ReorderWorkoutExercisesUseCase", () => {
  it("should reorder exercises when day belongs to user plan", async () => {
    const reordered: WorkoutExerciseResult[] = [
      {
        id: "ex-2",
        name: "B",
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
      },
      {
        id: "ex-1",
        name: "A",
        order: 1,
        workoutDayId: "day-1",
        description: null,
        sets: 3,
        reps: 10,
        weightKg: null,
        restTimeInSeconds: 60,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
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
      create: vi.fn(),
      findByDayId: vi.fn(),
      findByIdAndDayId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn().mockResolvedValue(reordered),
    };
    const useCase = new ReorderWorkoutExercisesUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    const result = await useCase.execute({
      dayId: "day-1",
      userId: "user-1",
      exerciseIdsInOrder: ["ex-2", "ex-1"],
    });

    expect(result).toEqual(reordered);
    expect(exerciseRepository.reorder).toHaveBeenCalledWith("day-1", [
      "ex-2",
      "ex-1",
    ]);
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
    const useCase = new ReorderWorkoutExercisesUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    await expect(
      useCase.execute({
        dayId: "day-1",
        userId: "user-1",
        exerciseIdsInOrder: ["ex-1", "ex-2"],
      }),
    ).rejects.toThrow(DayNotFoundError);
    expect(exerciseRepository.reorder).not.toHaveBeenCalled();
  });
});
