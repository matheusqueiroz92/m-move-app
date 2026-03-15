import { describe, expect, it, vi } from "vitest";

import { StudentLimitReachedError } from "../../domain/gym/errors/student-limit-reached.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type {
  GymStudentLinkRepository,
  GymStudentLinkResult,
} from "../../domain/gym/repositories/gym-student-link.repository.js";
import { InviteAlreadyUsedError } from "../../domain/pt-invite/errors/invite-already-used.error.js";
import { InviteExpiredError } from "../../domain/pt-invite/errors/invite-expired.error.js";
import { AcceptGymInviteUseCase } from "./accept-gym-invite.use-case.js";

const mockGymRepository: GymRepository = {
  create: vi.fn(),
  findById: vi.fn().mockResolvedValue({
    id: "gym-1",
    ownerId: "owner-1",
    maxStudents: 50,
    maxInstructors: 10,
  }),
  findByOwnerId: vi.fn(),
  update: vi.fn(),
};

describe("AcceptGymInviteUseCase", () => {
  it("should accept gym invite when token is valid and pending and gym under limit (RN-012)", async () => {
    const link: GymStudentLinkResult = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: "instructor-1",
      studentId: null,
      inviteEmail: "student@test.dev",
      inviteToken: "token-123",
      inviteExpiresAt: new Date(Date.now() + 86400000),
      status: "PENDING",
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const updated: GymStudentLinkResult = {
      ...link,
      studentId: "user-1",
      status: "ACTIVE",
      acceptedAt: new Date(),
    };
    const repository: GymStudentLinkRepository = {
      findByToken: vi.fn().mockResolvedValue(link),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn().mockResolvedValue(10),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(updated),
    };
    const useCase = new AcceptGymInviteUseCase(
      repository,
      mockGymRepository as GymRepository,
    );

    const result = await useCase.execute({
      token: "token-123",
      studentId: "user-1",
    });

    expect(result).toEqual(updated);
    expect(repository.findByToken).toHaveBeenCalledWith("token-123");
    expect(repository.updateStatus).toHaveBeenCalledWith(
      "link-1",
      "ACTIVE",
      expect.any(Date),
      undefined,
      "user-1",
    );
  });

  it("should throw StudentLimitReachedError when gym has reached maxStudents (RN-012)", async () => {
    const link: GymStudentLinkResult = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: null,
      studentId: null,
      inviteEmail: "s@t.dev",
      inviteToken: "token",
      inviteExpiresAt: new Date(Date.now() + 86400000),
      status: "PENDING",
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const repository: GymStudentLinkRepository = {
      findByToken: vi.fn().mockResolvedValue(link),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn().mockResolvedValue(50),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const gymRepo: GymRepository = {
      ...mockGymRepository,
      findById: vi.fn().mockResolvedValue({
        id: "gym-1",
        maxStudents: 50,
      }),
    } as unknown as GymRepository;
    const useCase = new AcceptGymInviteUseCase(repository, gymRepo);

    await expect(
      useCase.execute({ token: "token", studentId: "user-1" }),
    ).rejects.toThrow(StudentLimitReachedError);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("should throw InviteExpiredError when link not found", async () => {
    const repository: GymStudentLinkRepository = {
      findByToken: vi.fn().mockResolvedValue(null),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new AcceptGymInviteUseCase(
      repository,
      mockGymRepository as GymRepository,
    );

    await expect(
      useCase.execute({ token: "invalid", studentId: "user-1" }),
    ).rejects.toThrow(InviteExpiredError);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("should throw InviteExpiredError when token expired", async () => {
    const link: GymStudentLinkResult = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: null,
      studentId: null,
      inviteEmail: "s@t.dev",
      inviteToken: "token",
      inviteExpiresAt: new Date(Date.now() - 86400000),
      status: "PENDING",
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const repository: GymStudentLinkRepository = {
      findByToken: vi.fn().mockResolvedValue(link),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new AcceptGymInviteUseCase(
      repository,
      mockGymRepository as GymRepository,
    );

    await expect(
      useCase.execute({ token: "token", studentId: "user-1" }),
    ).rejects.toThrow(InviteExpiredError);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("should throw InviteAlreadyUsedError when status is not PENDING", async () => {
    const link: GymStudentLinkResult = {
      id: "link-1",
      gymId: "gym-1",
      instructorId: null,
      studentId: "user-0",
      inviteEmail: "s@t.dev",
      inviteToken: "token",
      inviteExpiresAt: new Date(Date.now() + 86400000),
      status: "ACTIVE",
      acceptedAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    };
    const repository: GymStudentLinkRepository = {
      findByToken: vi.fn().mockResolvedValue(link),
      hasActiveStudentInGym: vi.fn(),
      countActiveByGymId: vi.fn(),
      setInstructorIdNullForInstructorLinkId: vi.fn(),
      updateStatus: vi.fn(),
    };
    const useCase = new AcceptGymInviteUseCase(
      repository,
      mockGymRepository as GymRepository,
    );

    await expect(
      useCase.execute({ token: "token", studentId: "user-1" }),
    ).rejects.toThrow(InviteAlreadyUsedError);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
});
