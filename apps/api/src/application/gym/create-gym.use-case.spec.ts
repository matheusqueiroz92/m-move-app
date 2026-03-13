import { describe, expect, it, vi } from "vitest";

import type {
  CreateGymInput,
  GymRepository,
  GymResult,
} from "../../domain/gym/repositories/gym.repository.js";
import { CreateGymUseCase } from "./create-gym.use-case.js";

describe("CreateGymUseCase", () => {
  it("should create a gym and return the created gym", async () => {
    const created: GymResult = {
      id: "gym-1",
      name: "Academia Alpha",
      ownerId: "owner-1",
      maxInstructors: 10,
      maxStudents: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const create = vi.fn().mockResolvedValue(created);
    const repository: GymRepository = {
      create,
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new CreateGymUseCase(repository);

    const input: CreateGymInput = {
      name: "Academia Alpha",
      ownerId: "owner-1",
    };
    const result = await useCase.execute(input);

    expect(result).toEqual(created);
    expect(create).toHaveBeenCalledWith({
      name: "Academia Alpha",
      ownerId: "owner-1",
      maxInstructors: undefined,
      maxStudents: undefined,
    });
  });

  it("should pass maxInstructors and maxStudents when provided", async () => {
    const created: GymResult = {
      id: "gym-2",
      name: "Academia Beta",
      ownerId: "owner-1",
      maxInstructors: 5,
      maxStudents: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const create = vi.fn().mockResolvedValue(created);
    const repository: GymRepository = {
      create,
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new CreateGymUseCase(repository);

    const result = await useCase.execute({
      name: "Academia Beta",
      ownerId: "owner-1",
      maxInstructors: 5,
      maxStudents: 30,
    });

    expect(result).toEqual(created);
    expect(create).toHaveBeenCalledWith({
      name: "Academia Beta",
      ownerId: "owner-1",
      maxInstructors: 5,
      maxStudents: 30,
    });
  });
});
