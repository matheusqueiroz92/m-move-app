import { describe, expect, it, vi } from "vitest";

import { SessionNotFoundError } from "../../domain/workout/errors/session-not-found.error.js";
import { SessionNotStartedError } from "../../domain/workout/errors/session-not-started.error.js";
import type { WorkoutSessionResult } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";
import { CompleteWorkoutSessionUseCase } from "./complete-workout-session.use-case.js";

describe("CompleteWorkoutSessionUseCase", () => {
  it("should update completedAt when session belongs to user and was started", async () => {
    const existing: WorkoutSessionResult = {
      id: "sess-1",
      userId: "user-1",
      workoutDayId: "day-1",
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated: WorkoutSessionResult = {
      ...existing,
      completedAt: new Date(),
      updatedAt: new Date(),
    };
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(existing),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn().mockResolvedValue(updated),
      findCompletedSessionsByUserId: vi.fn(),
    };
    const useCase = new CompleteWorkoutSessionUseCase(sessionRepository);

    const result = await useCase.execute({
      sessionId: "sess-1",
      userId: "user-1",
    });

    expect(result).toEqual(updated);
    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledWith(
      "sess-1",
      "user-1",
    );
    expect(sessionRepository.updateCompletedAt).toHaveBeenCalledWith(
      "sess-1",
      "user-1",
      expect.any(Date),
    );
  });

  it("should throw SessionNotStartedError when session has no startedAt", async () => {
    const sessionWithNoStart: WorkoutSessionResult = {
      id: "sess-1",
      userId: "user-1",
      workoutDayId: "day-1",
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(sessionWithNoStart),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn(),
    };
    const useCase = new CompleteWorkoutSessionUseCase(sessionRepository);

    await expect(
      useCase.execute({ sessionId: "sess-1", userId: "user-1" }),
    ).rejects.toThrow(SessionNotStartedError);

    expect(sessionRepository.updateCompletedAt).not.toHaveBeenCalled();
  });

  it("should throw SessionNotFoundError when session not found or not owned by user", async () => {
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn().mockResolvedValue(null),
      findCompletedSessionsByUserId: vi.fn(),
    };
    const useCase = new CompleteWorkoutSessionUseCase(sessionRepository);

    await expect(
      useCase.execute({ sessionId: "sess-99", userId: "user-1" }),
    ).rejects.toThrow(SessionNotFoundError);
  });
});
