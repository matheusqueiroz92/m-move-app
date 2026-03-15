import { describe, expect, it, vi } from "vitest";

import { GymAccessDeniedError } from "../../domain/gym/errors/gym-access-denied.error.js";
import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import { StudentLimitReachedError } from "../../domain/gym/errors/student-limit-reached.error.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymStudentLinkRepository } from "../../domain/gym/repositories/gym-student-link.repository.js";
import { SendGymInviteUseCase } from "./send-gym-invite.use-case.js";

describe("SendGymInviteUseCase", () => {
  it("should create student invite when caller is OWNER and under limit", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
        maxStudents: 50,
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const created = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: null,
      studentId: null,
      inviteEmail: "student@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date(),
      status: "PENDING" as const,
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn().mockResolvedValue(created),
      findById: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn().mockResolvedValue(5),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymInstructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new SendGymInviteUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    const result = await useCase.execute({
      gymId: "gym-1",
      inviteEmail: "student@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date("2025-04-01"),
      userId: "owner-1",
    });

    expect(result).toEqual(created);
    expect(gymStudentLinkRepository.create).toHaveBeenCalledWith({
      gymId: "gym-1",
      instructorId: null,
      inviteEmail: "student@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date("2025-04-01"),
    });
  });

  it("should create student invite when caller is INSTRUCTOR and under limit", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
        maxStudents: 50,
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorLink = {
      id: "instructor-link-1",
      gymId: "gym-1",
      instructorId: "instructor-user-1",
      inviteEmail: "instr@test.dev",
      inviteToken: "t",
      inviteExpiresAt: new Date(),
      status: "ACTIVE" as const,
      acceptedAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    };
    const created = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: "instructor-link-1",
      studentId: null,
      inviteEmail: "student@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date(),
      status: "PENDING" as const,
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn().mockResolvedValue(created),
      findById: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn().mockResolvedValue(2),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymInstructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi
        .fn()
        .mockResolvedValue(instructorLink),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new SendGymInviteUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    const result = await useCase.execute({
      gymId: "gym-1",
      inviteEmail: "student@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date("2025-04-01"),
      userId: "instructor-user-1",
    });

    expect(result).toEqual(created);
    expect(gymStudentLinkRepository.create).toHaveBeenCalledWith({
      gymId: "gym-1",
      instructorId: "instructor-link-1",
      inviteEmail: "student@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date("2025-04-01"),
    });
  });

  it("should throw GymNotFoundError when gym does not exist", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymInstructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new SendGymInviteUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-missing",
        inviteEmail: "student@test.dev",
        inviteToken: "token",
        inviteExpiresAt: new Date(),
        userId: "owner-1",
      }),
    ).rejects.toThrow(GymNotFoundError);
  });

  it("should throw GymAccessDeniedError when user is neither OWNER nor INSTRUCTOR", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
        maxStudents: 50,
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymInstructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new SendGymInviteUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-1",
        inviteEmail: "student@test.dev",
        inviteToken: "token",
        inviteExpiresAt: new Date(),
        userId: "other-user",
      }),
    ).rejects.toThrow(GymAccessDeniedError);
  });

  it("should throw StudentLimitReachedError when gym is at maxStudents", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
        maxStudents: 10,
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn().mockResolvedValue(10),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymInstructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findActiveByGymIdAndInstructorUserId: vi.fn(),
      findById: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new SendGymInviteUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-1",
        inviteEmail: "student@test.dev",
        inviteToken: "token",
        inviteExpiresAt: new Date(),
        userId: "owner-1",
      }),
    ).rejects.toThrow(StudentLimitReachedError);
  });
});
