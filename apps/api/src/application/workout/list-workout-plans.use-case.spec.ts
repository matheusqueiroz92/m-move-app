import { describe, expect, it, vi } from "vitest";

import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";
import { ListWorkoutPlansUseCase } from "./list-workout-plans.use-case.js";

describe("ListWorkoutPlansUseCase", () => {
  it("should return all workout plans for the user", async () => {
    const plans: WorkoutPlanResult[] = [
      {
        id: "plan-1",
        name: "Plano A",
        description: "Desc A",
        userId: "user-1",
        createdBy: "user-1",
        isActive: true,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      },
      {
        id: "plan-2",
        name: "Plano B",
        description: null,
        userId: "user-1",
        createdBy: null,
        isActive: false,
        createdAt: new Date("2025-01-02"),
        updatedAt: new Date("2025-01-02"),
      },
    ];
    const findByUserIdPaginated = vi.fn().mockResolvedValue({
      items: plans,
      total: plans.length,
    });
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      createWithDaysAndExercises: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated,
      findByIdAndUserId: vi.fn(),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListWorkoutPlansUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual(plans);
    expect(result.total).toBe(2);
    expect(findByUserIdPaginated).toHaveBeenCalledWith("user-1", {
      limit: 20,
      offset: 0,
    });
  });

  it("should return empty items when user has no plans", async () => {
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      createWithDaysAndExercises: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdPaginated: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      findByIdAndUserId: vi.fn(),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
      activatePlanForUser: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListWorkoutPlansUseCase(repository);

    const result = await useCase.execute({
      userId: "user-empty",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
