export interface WorkoutSessionResult {
  id: string;
  userId: string;
  workoutDayId: string;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSessionRepository {
  create(input: {
    userId: string;
    workoutDayId: string;
    startedAt: Date;
  }): Promise<WorkoutSessionResult>;
  findById(sessionId: string): Promise<WorkoutSessionResult | null>;
  findByIdAndUserId(sessionId: string, userId: string): Promise<WorkoutSessionResult | null>;
  findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<WorkoutSessionResult[]>;
  updateCompletedAt(
    sessionId: string,
    userId: string,
    completedAt: Date,
  ): Promise<WorkoutSessionResult | null>;
  findCompletedSessionsByUserId(userId: string): Promise<WorkoutSessionResult[]>;
}
