import { describe, expect, it, vi } from "vitest";

import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type {
  GymRepository,
  GymResult,
} from "../../domain/gym/repositories/gym.repository.js";
import { GetGymByIdUseCase } from "./get-gym-by-id.use-case.js";

describe("GetGymByIdUseCase", () => {
  it("should return gym when found", async () => {
    const gym: GymResult = {
      id: "gym-1",
      name: "Academia Alpha",
      ownerId: "owner-1",
      maxInstructors: 10,
      maxStudents: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(gym),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new GetGymByIdUseCase(repository);

    const result = await useCase.execute({ id: "gym-1" });

    expect(result).toEqual(gym);
    expect(repository.findById).toHaveBeenCalledWith("gym-1");
  });

  it("should throw GymNotFoundError when gym does not exist", async () => {
    const repository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new GetGymByIdUseCase(repository);

    await expect(
      useCase.execute({ id: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow(GymNotFoundError);
  });
});
