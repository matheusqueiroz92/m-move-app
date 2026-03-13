import { describe, expect, it, vi } from "vitest";

import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import { ListGymMembersUseCase } from "./list-gym-members.use-case.js";

describe("ListGymMembersUseCase", () => {
  it("should return list of instructor links when gym exists and user is owner or instructor", async () => {
    const gymRepository: GymRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
      }),
      create: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const links = [
      {
        id: "link-1",
        gymId: "gym-1",
        instructorId: "instr-1",
        inviteEmail: "instr@test.dev",
        inviteToken: "t",
        inviteExpiresAt: new Date(),
        status: "ACTIVE" as const,
        acceptedAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      },
    ];
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn().mockResolvedValue(links),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListGymMembersUseCase(
      gymRepository,
      instructorRepository,
    );

    const result = await useCase.execute({
      gymId: "gym-1",
      userId: "owner-1",
    });

    expect(result).toEqual(links);
    expect(instructorRepository.findByGymId).toHaveBeenCalledWith("gym-1");
  });

  it("should throw GymNotFoundError when gym does not exist", async () => {
    const gymRepository: GymRepository = {
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListGymMembersUseCase(
      gymRepository,
      instructorRepository,
    );

    await expect(
      useCase.execute({ gymId: "gym-404", userId: "owner-1" }),
    ).rejects.toThrow(GymNotFoundError);
  });

  it("should throw GymNotFoundError when gym exists but user is not owner or instructor", async () => {
    const gymRepository: GymRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
      }),
      create: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListGymMembersUseCase(
      gymRepository,
      instructorRepository,
    );

    await expect(
      useCase.execute({ gymId: "gym-1", userId: "other-user" }),
    ).rejects.toThrow(GymNotFoundError);
  });
});
