import { describe, expect, it, vi } from "vitest";

import { GymAccessDeniedError } from "../../domain/gym/errors/gym-access-denied.error.js";
import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymStudentLinkRepository } from "../../domain/gym/repositories/gym-student-link.repository.js";
import { ListGymStudentsUseCase } from "./list-gym-students.use-case.js";

describe("ListGymStudentsUseCase", () => {
  it("should return all students when caller is OWNER", async () => {
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
    const items = [
      {
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
        studentName: "Student One",
        studentEmail: "s@test.dev",
      },
    ];
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymIdPaginated: vi.fn().mockResolvedValue({ items, total: 1 }),
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

    const useCase = new ListGymStudentsUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    const result = await useCase.execute({
      gymId: "gym-1",
      userId: "owner-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
    expect(gymStudentLinkRepository.findByGymIdPaginated).toHaveBeenCalledWith(
      "gym-1",
      { limit: 20, offset: 0 },
      null,
    );
  });

  it("should return only instructor students when caller is INSTRUCTOR", async () => {
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
      inviteEmail: "i@test.dev",
      inviteToken: "t",
      inviteExpiresAt: new Date(),
      status: "ACTIVE" as const,
      acceptedAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    };
    const items = [
      {
        id: "link-1",
        gymId: "gym-1",
        instructorId: "instructor-link-1",
        studentId: "student-1",
        inviteEmail: "s@test.dev",
        inviteToken: "t",
        inviteExpiresAt: new Date(),
        status: "ACTIVE" as const,
        acceptedAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
        studentName: "Student One",
        studentEmail: "s@test.dev",
      },
    ];
    const gymStudentLinkRepository: GymStudentLinkRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGymIdPaginated: vi.fn().mockResolvedValue({ items, total: 1 }),
      findByToken: vi.fn(),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
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

    const useCase = new ListGymStudentsUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    const result = await useCase.execute({
      gymId: "gym-1",
      userId: "instructor-user-1",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toHaveLength(1);
    expect(gymStudentLinkRepository.findByGymIdPaginated).toHaveBeenCalledWith(
      "gym-1",
      { limit: 20, offset: 0 },
      "instructor-link-1",
    );
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

    const useCase = new ListGymStudentsUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-missing",
        userId: "owner-1",
        limit: 20,
        offset: 0,
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

    const useCase = new ListGymStudentsUseCase(
      gymRepository,
      gymInstructorRepository,
      gymStudentLinkRepository,
    );

    await expect(
      useCase.execute({
        gymId: "gym-1",
        userId: "other-user",
        limit: 20,
        offset: 0,
      }),
    ).rejects.toThrow(GymAccessDeniedError);
  });
});
