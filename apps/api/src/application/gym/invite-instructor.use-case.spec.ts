import { describe, expect, it, vi } from "vitest";

import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import { InstructorLimitReachedError } from "../../domain/gym/errors/instructor-limit-reached.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import { InviteInstructorUseCase } from "./invite-instructor.use-case.js";

describe("InviteInstructorUseCase", () => {
  it("should create instructor invite when gym belongs to owner and under limit", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
        maxInstructors: 10,
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const created = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: null,
      inviteEmail: "instructor@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date(),
      status: "PENDING" as const,
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn().mockResolvedValue(created),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      countActiveByGymId: vi.fn().mockResolvedValue(2),
      delete: vi.fn(),
    };
    const useCase = new InviteInstructorUseCase(
      gymRepository,
      instructorRepository,
    );

    const result = await useCase.execute({
      gymId: "gym-1",
      ownerId: "owner-1",
      inviteEmail: "instructor@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date("2025-04-01"),
    });

    expect(result).toEqual(created);
    expect(instructorRepository.create).toHaveBeenCalledWith({
      gymId: "gym-1",
      inviteEmail: "instructor@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date("2025-04-01"),
    });
  });

  it("should throw GymNotFoundError when gym does not exist or not owned by ownerId", async () => {
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
    const useCase = new InviteInstructorUseCase(
      gymRepository,
      instructorRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-404",
        ownerId: "owner-1",
        inviteEmail: "instructor@test.dev",
        inviteToken: "token",
        inviteExpiresAt: new Date(),
      }),
    ).rejects.toThrow(GymNotFoundError);
  });

  it("should throw InstructorLimitReachedError when gym has reached maxInstructors", async () => {
    const gymRepository: GymRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
        maxInstructors: 2,
      }),
      create: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      countActiveByGymId: vi.fn().mockResolvedValue(2),
      delete: vi.fn(),
    };
    const useCase = new InviteInstructorUseCase(
      gymRepository,
      instructorRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-1",
        ownerId: "owner-1",
        inviteEmail: "instructor@test.dev",
        inviteToken: "token",
        inviteExpiresAt: new Date(),
      }),
    ).rejects.toThrow(InstructorLimitReachedError);
  });
});
