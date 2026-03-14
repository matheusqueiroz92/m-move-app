import { describe, expect, it, vi } from "vitest";

import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";
import { UpdateWorkoutPlanUseCase } from "./update-workout-plan.use-case.js";

describe("UpdateWorkoutPlanUseCase", () => {
  it("should update workout plan when plan belongs to user", async () => {
    const updated: WorkoutPlanResult = {
      id: "plan-1",
      name: "Plano Atualizado",
      description: "Descrição nova",
      userId: "user-1",
      createdBy: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
      update: vi.fn().mockResolvedValue(updated),
    } as unknown as WorkoutPlanRepository;
    const useCase = new UpdateWorkoutPlanUseCase(planRepository);

    const result = await useCase.execute({
      planId: "plan-1",
      userId: "user-1",
      name: "Plano Atualizado",
      description: "Descrição nova",
    });

    expect(result).toEqual(updated);
    expect(planRepository.update).toHaveBeenCalledWith("plan-1", "user-1", {
      name: "Plano Atualizado",
      description: "Descrição nova",
    });
  });

  it("should throw PlanNotFoundError when plan does not belong to user", async () => {
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    } as unknown as WorkoutPlanRepository;
    const useCase = new UpdateWorkoutPlanUseCase(planRepository);

    await expect(
      useCase.execute({
        planId: "plan-99",
        userId: "user-1",
        name: "Novo Nome",
      }),
    ).rejects.toThrow(PlanNotFoundError);
    expect(planRepository.update).not.toHaveBeenCalled();
  });

  it("should update only provided fields (partial update)", async () => {
    const updated: WorkoutPlanResult = {
      id: "plan-1",
      name: "Só o nome mudou",
      description: "Descrição original",
      userId: "user-1",
      createdBy: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const planRepository: WorkoutPlanRepository = {
      findByIdAndUserId: vi.fn().mockResolvedValue({ id: "plan-1" }),
      update: vi.fn().mockResolvedValue(updated),
    } as unknown as WorkoutPlanRepository;
    const useCase = new UpdateWorkoutPlanUseCase(planRepository);

    const result = await useCase.execute({
      planId: "plan-1",
      userId: "user-1",
      name: "Só o nome mudou",
    });

    expect(result).toEqual(updated);
    expect(planRepository.update).toHaveBeenCalledWith("plan-1", "user-1", {
      name: "Só o nome mudou",
    });
  });
});
