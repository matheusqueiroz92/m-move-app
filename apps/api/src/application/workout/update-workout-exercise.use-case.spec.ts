import { describe, expect, it, vi } from "vitest";

import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { ExerciseNotFoundError } from "../../domain/workout/errors/exercise-not-found.error.js";
import type {
  WorkoutExerciseRepository,
  WorkoutExerciseResult,
} from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";
import { UpdateWorkoutExerciseUseCase } from "./update-workout-exercise.use-case.js";

describe("UpdateWorkoutExerciseUseCase", () => {
  it("should update exercise when day belongs to user plan", async () => {
    const updated: WorkoutExerciseResult = {
      id: "ex-1",
      name: "Supino Inclinado",
      order: 1,
      workoutDayId: "day-1",
      description: null,
      sets: 4,
      reps: 12,
      weightKg: 20,
      restTimeInSeconds: 90,
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
      create: vi.fn(),
      findByDayId: vi.fn(),
      findByIdAndDayId: vi.fn(),
      update: vi.fn().mockResolvedValue(updated),
      delete: vi.fn(),
      reorder: vi.fn(),
    };
    const useCase = new UpdateWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    const result = await useCase.execute({
      dayId: "day-1",
      exerciseId: "ex-1",
      userId: "user-1",
      name: "Supino Inclinado",
      sets: 4,
      reps: 12,
      weightKg: 20,
    });

    expect(result).toEqual(updated);
    expect(exerciseRepository.update).toHaveBeenCalledWith(
      "ex-1",
      "day-1",
      expect.objectContaining({
        name: "Supino Inclinado",
        sets: 4,
        reps: 12,
        weightKg: 20,
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
    const useCase = new UpdateWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    await expect(
      useCase.execute({
        dayId: "day-1",
        exerciseId: "ex-1",
        userId: "user-1",
        name: "Nome Novo",
      }),
    ).rejects.toThrow(DayNotFoundError);
    expect(exerciseRepository.update).not.toHaveBeenCalled();
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
      update: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
      reorder: vi.fn(),
    };
    const useCase = new UpdateWorkoutExerciseUseCase(
      planRepository,
      dayRepository,
      exerciseRepository,
    );

    await expect(
      useCase.execute({
        dayId: "day-1",
        exerciseId: "ex-99",
        userId: "user-1",
        name: "Nome Novo",
      }),
    ).rejects.toThrow(ExerciseNotFoundError);
  });
});
