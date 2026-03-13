import { describe, expect, it, vi } from "vitest";

import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type {
  GymRepository,
  GymResult,
  UpdateGymInput,
} from "../../domain/gym/repositories/gym.repository.js";
import { UpdateGymUseCase } from "./update-gym.use-case.js";

describe("UpdateGymUseCase", () => {
  it("should update gym when it exists and belongs to owner", async () => {
    const updated: GymResult = {
      id: "gym-1",
      name: "Academia Alpha Updated",
      ownerId: "owner-1",
      maxInstructors: 15,
      maxStudents: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "gym-1", ownerId: "owner-1" }),
      findByOwnerId: vi.fn(),
      update: vi.fn().mockResolvedValue(updated),
    };
    const useCase = new UpdateGymUseCase(repository);

    const input: UpdateGymInput = {
      name: "Academia Alpha Updated",
      maxInstructors: 15,
    };
    const result = await useCase.execute({
      gymId: "gym-1",
      ownerId: "owner-1",
      input,
    });

    expect(result).toEqual(updated);
    expect(repository.update).toHaveBeenCalledWith("gym-1", input);
  });

  it("should throw GymNotFoundError when gym does not exist", async () => {
    const repository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new UpdateGymUseCase(repository);

    await expect(
      useCase.execute({
        gymId: "gym-404",
        ownerId: "owner-1",
        input: { name: "New Name" },
      }),
    ).rejects.toThrow(GymNotFoundError);
  });

  it("should throw GymNotFoundError when gym exists but ownerId does not match", async () => {
    const repository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "other-owner",
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new UpdateGymUseCase(repository);

    await expect(
      useCase.execute({
        gymId: "gym-1",
        ownerId: "owner-1",
        input: { name: "New Name" },
      }),
    ).rejects.toThrow(GymNotFoundError);
  });
});
