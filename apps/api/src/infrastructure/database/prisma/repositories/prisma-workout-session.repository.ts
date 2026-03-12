import type {
  WorkoutSessionRepository,
  WorkoutSessionResult,
} from "../../../../domain/workout/repositories/workout-session.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toWorkoutSessionResult } from "../mappers/workout-session.mapper.js";

export class PrismaWorkoutSessionRepository implements WorkoutSessionRepository {
  async create(input: {
    userId: string;
    workoutDayId: string;
    startedAt: Date;
  }): Promise<WorkoutSessionResult> {
    const session = await prisma.workoutSession.create({
      data: {
        userId: input.userId,
        workoutDayId: input.workoutDayId,
        startedAt: input.startedAt,
      },
    });
    return toWorkoutSessionResult(session);
  }

  async findById(sessionId: string): Promise<WorkoutSessionResult | null> {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });
    return session ? toWorkoutSessionResult(session) : null;
  }

  async findByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<WorkoutSessionResult | null> {
    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });
    return session ? toWorkoutSessionResult(session) : null;
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<WorkoutSessionResult[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
    return sessions.map(toWorkoutSessionResult);
  }

  async updateCompletedAt(
    sessionId: string,
    userId: string,
    completedAt: Date,
  ): Promise<WorkoutSessionResult | null> {
    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return null;
    const updated = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { completedAt },
    });
    return toWorkoutSessionResult(updated);
  }

  async findCompletedSessionsByUserId(
    userId: string,
  ): Promise<WorkoutSessionResult[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
    });
    return sessions.map(toWorkoutSessionResult);
  }
}
