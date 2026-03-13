import { describe, expect, it, vi } from "vitest";

import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { ExerciseNotFoundError } from "../../domain/workout/errors/exercise-not-found.error.js";
import type { WorkoutExerciseRepository } from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";
import { DeleteWorkoutExerciseUseCase } from "./delete-workout-exercise.use-case.js";

describe("DeleteWorkoutExerciseUseCase", () => {
  it("should delete exercise when day belongs to user plan", async () => {
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
      delete: vi.fn().mockResolvedValue(true),
      reorder: vi.fn(),
    };
    const useCase = new DeleteWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    await useCase.execute({
      dayId: "day-1",
      exerciseId: "ex-1",
      userId: "user-1",
    });

    expect(exerciseRepository.delete).toHaveBeenCalledWith("ex-1", "day-1");
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
    const useCase = new DeleteWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    await expect(
      useCase.execute({
        dayId: "day-1",
        exerciseId: "ex-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(DayNotFoundError);
    expect(exerciseRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw ExerciseNotFoundError when exercise does not exist", async () => {
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
      delete: vi.fn().mockResolvedValue(false),
      reorder: vi.fn(),
    };
    const useCase = new DeleteWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    await expect(
      useCase.execute({
        dayId: "day-1",
        exerciseId: "ex-99",
        userId: "user-1",
      }),
    ).rejects.toThrow(ExerciseNotFoundError);
  });
});
