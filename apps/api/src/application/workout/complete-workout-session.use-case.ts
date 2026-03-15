import { SessionNotFoundError } from "../../domain/workout/errors/session-not-found.error.js";
import { SessionNotStartedError } from "../../domain/workout/errors/session-not-started.error.js";
import type { WorkoutSessionResult } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";

export interface CompleteWorkoutSessionInput {
  sessionId: string;
  userId: string;
}

export class CompleteWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(input: CompleteWorkoutSessionInput): Promise<WorkoutSessionResult> {
    const session = await this.workoutSessionRepository.findByIdAndUserId(
      input.sessionId,
      input.userId,
    );
    if (!session) throw new SessionNotFoundError(input.sessionId);

    if (!session.startedAt) {
      throw new SessionNotStartedError(input.sessionId);
    }

    const updated = await this.workoutSessionRepository.updateCompletedAt(
      input.sessionId,
      input.userId,
      new Date(),
    );
    if (!updated) throw new SessionNotFoundError(input.sessionId);
    return updated;
  }
}
