import type { OpenAIPlanProvider } from "../../domain/ai/providers/openai-provider.interface.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";

export interface GenerateWorkoutPlanWithAIInput {
  userId: string;
  objective: string;
  level: string;
  daysPerWeek: number;
  equipment?: string[];
  restrictions?: string;
}

export class GenerateWorkoutPlanWithAIUseCase {
  constructor(
    private readonly aiProvider: OpenAIPlanProvider,
    private readonly workoutPlanRepository: WorkoutPlanRepository,
  ) {}

  async execute(
    input: GenerateWorkoutPlanWithAIInput,
  ): Promise<{ id: string; name: string; description: string | null }> {
    const generated = await this.aiProvider.generateWorkoutPlan({
      userId: input.userId,
      objective: input.objective,
      level: input.level,
      daysPerWeek: input.daysPerWeek,
      equipment: input.equipment,
      restrictions: input.restrictions,
    });

    const plan = await this.workoutPlanRepository.createWithDaysAndExercises({
      userId: input.userId,
      name: generated.name,
      description: generated.description,
      createdBy: null,
      days: generated.days.map((day) => ({
        name: day.name,
        isRest: day.isRest,
        weekDay: day.weekDay,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds ?? null,
        exercises: day.exercises.map((ex) => ({
          name: ex.name,
          order: ex.order,
          sets: ex.sets,
          reps: ex.reps,
          restTimeInSeconds: ex.restTimeInSeconds,
          description: ex.description ?? null,
          notes: ex.notes ?? null,
        })),
      })),
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
    };
  }
}
