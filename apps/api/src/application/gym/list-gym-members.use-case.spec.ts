import { describe, expect, it, vi } from "vitest";

import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
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
    const findByGymIdPaginated = vi.fn().mockResolvedValue({
      items: links,
      total: links.length,
    });
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated,
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
      limit: 20,
      offset: 0,
    });

    expect(result.items).toEqual(links);
    expect(findByGymIdPaginated).toHaveBeenCalledWith("gym-1", {
      limit: 20,
      offset: 0,
    });
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
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListGymMembersUseCase(
      gymRepository,
      instructorRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-404",
        userId: "owner-1",
        limit: 20,
        offset: 0,
      }),
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
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListGymMembersUseCase(
      gymRepository,
      instructorRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-1",
        userId: "other-user",
        limit: 20,
        offset: 0,
      }),
    ).rejects.toThrow(GymNotFoundError);
  });
});
