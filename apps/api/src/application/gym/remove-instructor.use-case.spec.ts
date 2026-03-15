import { describe, expect, it, vi } from "vitest";

import { InstructorLinkNotFoundError } from "../../domain/gym/errors/instructor-link-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymStudentLinkRepository } from "../../domain/gym/repositories/gym-student-link.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";
import { RemoveInstructorUseCase } from "./remove-instructor.use-case.js";

const mockGymStudentLinkRepo: GymStudentLinkRepository = {
  findByToken: vi.fn(),
  hasActiveStudentInGym: vi.fn(),
  countActiveByGymId: vi.fn(),
  setInstructorIdNullForInstructorLinkId: vi.fn().mockResolvedValue(undefined),
  updateStatus: vi.fn(),
};

const mockWorkoutPlanRepo: WorkoutPlanRepository = {
  create: vi.fn(),
  createWithDaysAndExercises: vi.fn(),
  findByUserId: vi.fn(),
  findByUserIdPaginated: vi.fn(),
  findAssignedPlansByUserIdPaginated: vi.fn(),
  findByIdAndUserId: vi.fn(),
  deactivateAllByUserId: vi.fn(),
  updateIsActive: vi.fn(),
  activatePlanForUser: vi.fn(),
  reassignCreatedBy: vi.fn().mockResolvedValue(undefined),
  update: vi.fn(),
  delete: vi.fn(),
};

describe("RemoveInstructorUseCase", () => {
  it("should reassign students and plans to owner then remove instructor link (RN-16, RN-17)", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "link-1",
        gymId: "gym-1",
        instructorId: "instr-1",
        inviteEmail: "instr@test.dev",
        inviteToken: "t",
        inviteExpiresAt: new Date(),
        status: "ACTIVE",
        acceptedAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      }),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
    };
    const setInstructorIdNull = vi.fn().mockResolvedValue(undefined);
    const reassignCreatedBy = vi.fn().mockResolvedValue(undefined);
    const useCase = new RemoveInstructorUseCase(
      gymRepository,
      instructorRepository,
      {
        ...mockGymStudentLinkRepo,
        setInstructorIdNullForInstructorLinkId: setInstructorIdNull,
      },
      { ...mockWorkoutPlanRepo, reassignCreatedBy },
    );

    await useCase.execute({
      linkId: "link-1",
      ownerId: "owner-1",
    });

    expect(setInstructorIdNull).toHaveBeenCalledWith("link-1");
    expect(reassignCreatedBy).toHaveBeenCalledWith("instr-1", "owner-1");
    expect(instructorRepository.delete).toHaveBeenCalledWith("link-1");
  });

  it("should not call reassignCreatedBy when instructor link has no instructorId (pending invite)", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "link-1",
        gymId: "gym-1",
        instructorId: null,
        inviteEmail: "pending@test.dev",
        inviteToken: "t",
        inviteExpiresAt: new Date(),
        status: "PENDING",
        acceptedAt: null,
        revokedAt: null,
        createdAt: new Date(),
      }),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
    };
    const reassignCreatedBy = vi.fn().mockResolvedValue(undefined);
    const useCase = new RemoveInstructorUseCase(
      gymRepository,
      instructorRepository,
      mockGymStudentLinkRepo,
      { ...mockWorkoutPlanRepo, reassignCreatedBy },
    );

    await useCase.execute({
      linkId: "link-1",
      ownerId: "owner-1",
    });

    expect(reassignCreatedBy).not.toHaveBeenCalled();
    expect(instructorRepository.delete).toHaveBeenCalledWith("link-1");
  });

  it("should remove instructor link when it exists and gym belongs to owner", async () => {
    const gymRepository: GymRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "owner-1",
      }),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "link-1",
        gymId: "gym-1",
        instructorId: "instr-1",
        inviteEmail: "instr@test.dev",
        inviteToken: "t",
        inviteExpiresAt: new Date(),
        status: "ACTIVE",
        acceptedAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      }),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
    };
    const useCase = new RemoveInstructorUseCase(
      gymRepository,
      instructorRepository,
      mockGymStudentLinkRepo,
      mockWorkoutPlanRepo,
    );

    await useCase.execute({
      linkId: "link-1",
      ownerId: "owner-1",
    });

    expect(instructorRepository.delete).toHaveBeenCalledWith("link-1");
  });

  it("should throw InstructorLinkNotFoundError when link does not exist", async () => {
    const gymRepository: GymRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      findActiveGymIdByInstructorId: vi.fn(),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new RemoveInstructorUseCase(
      gymRepository,
      instructorRepository,
      mockGymStudentLinkRepo,
      mockWorkoutPlanRepo,
    );

    await expect(
      useCase.execute({ linkId: "link-404", ownerId: "owner-1" }),
    ).rejects.toThrow(InstructorLinkNotFoundError);
  });

  it("should throw InstructorLinkNotFoundError when link exists but gym is not owned by ownerId", async () => {
    const gymRepository: GymRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        ownerId: "other-owner",
      }),
      create: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
    };
    const instructorRepository: GymInstructorRepository = {
      findActiveGymIdByInstructorId: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "link-1",
        gymId: "gym-1",
        instructorId: "instr-1",
        inviteEmail: "instr@test.dev",
        inviteToken: "t",
        inviteExpiresAt: new Date(),
        status: "ACTIVE",
        acceptedAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      }),
      findByGymId: vi.fn(),
      findByGymIdPaginated: vi.fn(),
      countActiveByGymId: vi.fn(),
      delete: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: "link-1",
        gymId: "gym-1",
        instructorId: "instr-1",
        inviteEmail: "instr@test.dev",
        inviteToken: "t",
        inviteExpiresAt: new Date(),
        status: "ACTIVE",
      }),
    };
    const useCase = new RemoveInstructorUseCase(
      gymRepository,
      instructorRepository,
      mockGymStudentLinkRepo,
      mockWorkoutPlanRepo,
    );

    await expect(
      useCase.execute({ linkId: "link-1", ownerId: "owner-1" }),
    ).rejects.toThrow(InstructorLinkNotFoundError);
  });
});
