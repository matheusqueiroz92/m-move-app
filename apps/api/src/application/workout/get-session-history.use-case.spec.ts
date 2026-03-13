import { describe, expect, it, vi } from "vitest";

import type { WorkoutSessionResult } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";
import { GetSessionHistoryUseCase } from "./get-session-history.use-case.js";

describe("GetSessionHistoryUseCase", () => {
  it("should return sessions list when user has sessions", async () => {
    const sessions: WorkoutSessionResult[] = [
      {
        id: "sess-1",
        userId: "user-1",
        workoutDayId: "day-1",
        startedAt: new Date("2025-03-10T10:00:00Z"),
        completedAt: new Date("2025-03-10T11:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sess-2",
        userId: "user-1",
        workoutDayId: "day-2",
        startedAt: new Date("2025-03-09T10:00:00Z"),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue(sessions),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn(),
    };
    const useCase = new GetSessionHistoryUseCase(sessionRepository);

    const result = await useCase.execute({
      userId: "user-1",
    });

    expect(result).toEqual(sessions);
    expect(sessionRepository.findByUserId).toHaveBeenCalledWith("user-1", {
      limit: undefined,
      offset: undefined,
    });
  });

  it("should pass limit and offset to repository when provided", async () => {
    const sessionRepository: WorkoutSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue([]),
      updateCompletedAt: vi.fn(),
      findCompletedSessionsByUserId: vi.fn(),
    };
    const useCase = new GetSessionHistoryUseCase(sessionRepository);

    await useCase.execute({
      userId: "user-1",
      limit: 10,
      offset: 5,
    });

    expect(sessionRepository.findByUserId).toHaveBeenCalledWith("user-1", {
      limit: 10,
      offset: 5,
    });
  });
});
