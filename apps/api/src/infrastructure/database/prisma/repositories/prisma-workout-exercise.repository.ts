import type {
  CreateWorkoutExerciseInput,
  UpdateWorkoutExerciseInput,
  WorkoutExerciseRepository,
  WorkoutExerciseResult,
} from "../../../../domain/workout/repositories/workout-exercise.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toWorkoutExerciseResult } from "../mappers/workout-exercise.mapper.js";

export class PrismaWorkoutExerciseRepository
  implements WorkoutExerciseRepository
{
  async create(
    input: CreateWorkoutExerciseInput,
  ): Promise<WorkoutExerciseResult> {
    const exercise = await prisma.workoutExercise.create({
      data: {
        name: input.name,
        order: input.order,
        workoutDayId: input.workoutDayId,
        description: input.description ?? undefined,
        sets: input.sets,
        reps: input.reps,
        weightKg: input.weightKg ?? undefined,
        restTimeInSeconds: input.restTimeInSeconds,
        notes: input.notes ?? undefined,
      },
    });
    return toWorkoutExerciseResult(exercise);
  }

  async findByDayId(workoutDayId: string): Promise<WorkoutExerciseResult[]> {
    const exercises = await prisma.workoutExercise.findMany({
      where: { workoutDayId },
      orderBy: { order: "asc" },
    });
    return exercises.map(toWorkoutExerciseResult);
  }

  async findByIdAndDayId(
    exerciseId: string,
    workoutDayId: string,
  ): Promise<WorkoutExerciseResult | null> {
    const exercise = await prisma.workoutExercise.findFirst({
      where: { id: exerciseId, workoutDayId },
    });
    return exercise ? toWorkoutExerciseResult(exercise) : null;
  }

  async update(
    exerciseId: string,
    workoutDayId: string,
    input: UpdateWorkoutExerciseInput,
  ): Promise<WorkoutExerciseResult | null> {
    const existing = await prisma.workoutExercise.findFirst({
      where: { id: exerciseId, workoutDayId },
    });
    if (!existing) return null;
    const updated = await prisma.workoutExercise.update({
      where: { id: exerciseId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.sets !== undefined && { sets: input.sets }),
        ...(input.reps !== undefined && { reps: input.reps }),
        ...(input.weightKg !== undefined && { weightKg: input.weightKg }),
        ...(input.restTimeInSeconds !== undefined && {
          restTimeInSeconds: input.restTimeInSeconds,
        }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
    return toWorkoutExerciseResult(updated);
  }

  async delete(
    exerciseId: string,
    workoutDayId: string,
  ): Promise<boolean> {
    const result = await prisma.workoutExercise.deleteMany({
      where: { id: exerciseId, workoutDayId },
    });
    return result.count > 0;
  }

  async reorder(
    workoutDayId: string,
    exerciseIdsInOrder: string[],
  ): Promise<WorkoutExerciseResult[]> {
    await prisma.$transaction(
      exerciseIdsInOrder.map((id, index) =>
        prisma.workoutExercise.updateMany({
          where: { id, workoutDayId },
          data: { order: index },
        }),
      ),
    );
    return this.findByDayId(workoutDayId);
  }
}
