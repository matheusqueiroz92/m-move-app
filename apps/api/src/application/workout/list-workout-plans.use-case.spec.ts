import { describe, expect, it, vi } from "vitest";

import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plant.repository.js";
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
    const findByUserId = vi.fn().mockResolvedValue(plans);
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      findByUserId,
      findByIdAndUserId: vi.fn(),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
    };
    const useCase = new ListWorkoutPlansUseCase(repository);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toEqual(plans);
    expect(findByUserId).toHaveBeenCalledWith("user-1");
  });

  it("should return empty array when user has no plans", async () => {
    const repository: WorkoutPlanRepository = {
      create: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue([]),
      findByIdAndUserId: vi.fn(),
      deactivateAllByUserId: vi.fn(),
      updateIsActive: vi.fn(),
    };
    const useCase = new ListWorkoutPlansUseCase(repository);

    const result = await useCase.execute({ userId: "user-empty" });

    expect(result).toEqual([]);
  });
});
