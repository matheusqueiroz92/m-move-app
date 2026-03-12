import type { WorkoutSessionResult } from "../../domain/workout/repositories/workout-session.repository.js";
import type { WorkoutSessionRepository } from "../../domain/workout/repositories/workout-session.repository.js";

export interface GetSessionHistoryInput {
  userId: string;
  limit?: number;
  offset?: number;
}

export class GetSessionHistoryUseCase {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(input: GetSessionHistoryInput): Promise<WorkoutSessionResult[]> {
    return this.workoutSessionRepository.findByUserId(input.userId, {
      limit: input.limit,
      offset: input.offset,
    });
  }
}
