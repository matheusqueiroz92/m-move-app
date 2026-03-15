import { describe, expect, it, vi } from "vitest";

import { CannotDeleteLastExerciseError } from "../../domain/workout/errors/cannot-delete-last-exercise.error.js";
import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { ExerciseNotFoundError } from "../../domain/workout/errors/exercise-not-found.error.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutExerciseRepository } from "../../domain/workout/repositories/workout-exercise.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";
import { DeleteWorkoutExerciseUseCase } from "./delete-workout-exercise.use-case.js";

describe("DeleteWorkoutExerciseUseCase", () => {
  it("should delete exercise when day has more than one exercise (RF-008)", async () => {
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
      findByDayId: vi.fn().mockResolvedValue([
        { id: "ex-1", name: "Ex1", order: 0 },
        { id: "ex-2", name: "Ex2", order: 1 },
      ]),
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

  it("should throw CannotDeleteLastExerciseError when day has only one exercise (RF-008)", async () => {
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
      findByDayId: vi
        .fn()
        .mockResolvedValue([{ id: "ex-1", name: "Only", order: 0 }]),
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
    ).rejects.toThrow(CannotDeleteLastExerciseError);
    expect(exerciseRepository.delete).not.toHaveBeenCalled();
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
      findByDayId: vi.fn().mockResolvedValue([{ id: "ex-1" }, { id: "ex-99" }]),
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
