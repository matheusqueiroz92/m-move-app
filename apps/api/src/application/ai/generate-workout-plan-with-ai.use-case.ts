import type { OpenAIPlanProvider } from "../../domain/ai/providers/openai-provider.interface.js";
import type { WorkoutDayRepository } from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutExerciseRepository } from "../../domain/workout/repositories/workout-exercise.repository.js";
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
    private readonly workoutDayRepository: WorkoutDayRepository,
    private readonly workoutExerciseRepository: WorkoutExerciseRepository,
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

    const plan = await this.workoutPlanRepository.create({
      userId: input.userId,
      name: generated.name,
      description: generated.description,
      createdBy: null,
    });

    for (const day of generated.days) {
      const createdDay = await this.workoutDayRepository.create({
        workoutPlanId: plan.id,
        name: day.name,
        isRest: day.isRest,
        weekDay: day.weekDay,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds ?? null,
      });

      for (const ex of day.exercises) {
        await this.workoutExerciseRepository.create({
          workoutDayId: createdDay.id,
          name: ex.name,
          order: ex.order,
          sets: ex.sets,
          reps: ex.reps,
          restTimeInSeconds: ex.restTimeInSeconds,
          description: ex.description ?? null,
          notes: ex.notes ?? null,
        });
      }
    }

    const result = await this.workoutPlanRepository.findByIdAndUserId(
      plan.id,
      input.userId,
    );
    if (!result) throw new Error("Plan not found after create");
    return {
      id: result.id,
      name: result.name,
      description: result.description,
    };
  }
}
