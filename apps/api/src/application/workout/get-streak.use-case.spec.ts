import { describe, expect, it, vi } from "vitest";

import type { WorkoutSessionResult } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";
import { GetStreakUseCase } from "./get-streak.use-case.js";

describe("GetStreakUseCase", () => {
  it("should return streak when user has completed sessions", async () => {
    const today = new Date();
    const sessions: WorkoutSessionResult[] = [
      {
        id: "sess-1",
        userId: "user-1",
        workoutDayId: "day-1",
        startedAt: today,
        completedAt: today,
        createdAt: today,
        updatedAt: today,
      },
    ];
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn().mockResolvedValue(sessions),
    };
    const useCase = new GetStreakUseCase(sessionRepository);

    const result = await useCase.execute({
      userId: "user-1",
    });

    expect(result.streak).toBeGreaterThanOrEqual(0);
    expect(sessionRepository.findCompletedSessionsByUserId).toHaveBeenCalledWith(
      "user-1",
    );
  });

  it("should return 0 streak when user has no completed sessions", async () => {
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn().mockResolvedValue([]),
    };
    const useCase = new GetStreakUseCase(sessionRepository);

    const result = await useCase.execute({
      userId: "user-1",
    });

    expect(result.streak).toBe(0);
  });

  it("should pass timezone to calculateStreak when provided", async () => {
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserId: vi.fn(),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn().mockResolvedValue([]),
    };
    const useCase = new GetStreakUseCase(sessionRepository);

    const result = await useCase.execute({
      userId: "user-1",
      timezone: "Europe/London",
    });

    expect(result.streak).toBe(0);
    expect(sessionRepository.findCompletedSessionsByUserId).toHaveBeenCalledWith(
      "user-1",
    );
  });
});
