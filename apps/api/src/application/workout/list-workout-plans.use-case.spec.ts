import { describe, expect, it, vi } from "vitest";

import type { UserRepository } from "../../domain/user/repositories/user.repository.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";
import { ListWorkoutPlansUseCase } from "./list-workout-plans.use-case.js";

const workoutPlanRepositoryMock = (overrides: Partial<WorkoutPlanRepository> = {}): WorkoutPlanRepository => ({
  create: vi.fn(),
  createWithDaysAndExercises: vi.fn(),
  findByUserId: vi.fn(),
  findByUserIdPaginated: vi.fn(),
  findAssignedPlansByUserIdPaginated: vi.fn(),
  findByIdAndUserId: vi.fn(),
  deactivateAllByUserId: vi.fn(),
  updateIsActive: vi.fn(),
  activatePlanForUser: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  ...overrides,
});

const userRepositoryMock = (overrides: Partial<UserRepository> = {}): UserRepository => ({
  findById: vi.fn(),
  findByIdWithPlanAndTimezone: vi.fn(),
  getStripeCustomerId: vi.fn(),
  updateSubscriptionFields: vi.fn(),
  ...overrides,
});

describe("ListWorkoutPlansUseCase", () => {
  it("should return all workout plans for non-LINKED_STUDENT user", async () => {
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
    const useCase = new ListWorkoutPlansUseCase(
      workoutPlanRepositoryMock({ findByUserIdPaginated }),
      userRepositoryMock({
        findById: vi.fn().mockResolvedValue({ id: "user-1", role: "STUDENT" }),
      }),
    );

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

  it("should return only assigned plans for LINKED_STUDENT (RF-018)", async () => {
    const assignedPlans: WorkoutPlanResult[] = [
      {
        id: "plan-assigned",
        name: "Plano do PT",
        description: null,
        userId: "linked-student-1",
        createdBy: "pt-1",
        isActive: true,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      },
    ];
    const findAssignedPlansByUserIdPaginated = vi.fn().mockResolvedValue({
      items: assignedPlans,
      total: 1,
    });
    const useCase = new ListWorkoutPlansUseCase(
      workoutPlanRepositoryMock({ findAssignedPlansByUserIdPaginated }),
      userRepositoryMock({
        findById: vi.fn().mockResolvedValue({
          id: "linked-student-1",
          role: "LINKED_STUDENT",
        }),
      }),
    );

    const result = await useCase.execute({
      userId: "linked-student-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual(assignedPlans);
    expect(result.total).toBe(1);
    expect(findAssignedPlansByUserIdPaginated).toHaveBeenCalledWith(
      "linked-student-1",
      { limit: 20, offset: 0 },
    );
  });

  it("should return empty items when user has no plans", async () => {
    const useCase = new ListWorkoutPlansUseCase(
      workoutPlanRepositoryMock({
        findByUserIdPaginated: vi.fn().mockResolvedValue({
          items: [],
          total: 0,
        }),
      }),
      userRepositoryMock({
        findById: vi.fn().mockResolvedValue({ id: "user-empty", role: "STUDENT" }),
      }),
    );

    const result = await useCase.execute({
      userId: "user-empty",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
