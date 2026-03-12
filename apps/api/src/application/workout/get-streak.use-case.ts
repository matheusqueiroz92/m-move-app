import { calculateStreak } from "@m-move-app/utils";

import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";

export interface GetStreakInput {
  userId: string;
  timezone?: string;
}

export class GetStreakUseCase {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(input: GetStreakInput): Promise<{ streak: number }> {
    const sessions =
      await this.workoutSessionRepository.findCompletedSessionsByUserId(
        input.userId,
      );
    const completedDates = sessions
      .map((s) => s.completedAt)
      .filter((d): d is Date => d !== null);
    const streak = calculateStreak(
      completedDates,
      input.timezone ?? "America/Sao_Paulo",
    );
    return { streak };
  }
}
