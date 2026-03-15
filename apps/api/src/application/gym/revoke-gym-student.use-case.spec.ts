import { describe, expect, it, vi } from "vitest";

import { GymAccessDeniedError } from "../../domain/gym/errors/gym-access-denied.error.js";
import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import { GymStudentLinkNotFoundError } from "../../domain/gym/errors/gym-student-link-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymStudentLinkRepository } from "../../domain/gym/repositories/gym-student-link.repository.js";
import { RevokeGymStudentUseCase } from "./revoke-gym-student.use-case.js";

describe("RevokeGymStudentUseCase", () => {
  it("should revoke link when caller is OWNER of the gym", async () => {
    const link = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: null,
      studentId: "student-1",
      inviteEmail: "s@test.dev",
      inviteToken: "t",
      inviteExpiresAt: new Date(),
      status: "ACTIVE" as const,
      acceptedAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    };
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(link),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(null),
    };
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };

    const useCase = new RevokeGymStudentUseCase(
      gymStudentLinkRepository,
      gymRepository,
    );

    await useCase.execute({ linkId: "link-1", userId: "owner-1" });

    expect(gymStudentLinkRepository.updateStatus).toHaveBeenCalledWith(
      "link-1",
      "REVOKED",
      undefined,
      expect.any(Date),
      undefined,
    );
  });

  it("should throw GymStudentLinkNotFoundError when link does not exist", async () => {
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };

    const useCase = new RevokeGymStudentUseCase(
      gymStudentLinkRepository,
      gymRepository,
    );

    await expect(
      useCase.execute({ linkId: "link-missing", userId: "owner-1" }),
    ).rejects.toThrow(GymStudentLinkNotFoundError);
    expect(gymStudentLinkRepository.updateStatus).not.toHaveBeenCalled();
  });

  it("should throw GymAccessDeniedError when caller is not OWNER of the gym", async () => {
    const link = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: null,
      studentId: "student-1",
      inviteEmail: "s@test.dev",
      inviteToken: "t",
      inviteExpiresAt: new Date(),
      status: "ACTIVE" as const,
      acceptedAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    };
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(link),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };

    const useCase = new RevokeGymStudentUseCase(
      gymStudentLinkRepository,
      gymRepository,
    );

    await expect(
      useCase.execute({ linkId: "link-1", userId: "other-user" }),
    ).rejects.toThrow(GymAccessDeniedError);
    expect(gymStudentLinkRepository.updateStatus).not.toHaveBeenCalled();
  });
});
