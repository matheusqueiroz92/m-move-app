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
  it("should create exercise with order 0 when day has no exercises (RF-011)", async () => {
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
      findByDayId: vi.fn().mockResolvedValue([]),
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

  it("should create exercise with order last+1 when day has existing exercises (RF-011)", async () => {
    const created: WorkoutExerciseResult = {
      id: "ex-2",
      name: "Remada",
      order: 2,
      workoutDayId: "day-1",
      description: null,
      sets: 3,
      reps: 12,
      weightKg: null,
      restTimeInSeconds: 45,
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
      findByDayId: vi.fn().mockResolvedValue([
        {
          id: "ex-0",
          order: 0,
          name: "",
          workoutDayId: "",
          description: null,
          sets: 0,
          reps: 0,
          weightKg: null,
          restTimeInSeconds: 0,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "ex-1",
          order: 1,
          name: "",
          workoutDayId: "",
          description: null,
          sets: 0,
          reps: 0,
          weightKg: null,
          restTimeInSeconds: 0,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
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

    await useCase.execute({
      dayId: "day-1",
      userId: "user-1",
      name: "Remada",
      order: 99,
      sets: 3,
      reps: 12,
      restTimeInSeconds: 45,
    });

    expect(exerciseRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Remada",
        order: 2,
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
        sets: 3,
        reps: 10,
        restTimeInSeconds: 60,
      }),
    ).rejects.toThrow(DayNotFoundError);
    expect(exerciseRepository.create).not.toHaveBeenCalled();
  });
});
