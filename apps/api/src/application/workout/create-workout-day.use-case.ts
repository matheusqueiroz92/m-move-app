import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  CreateWorkoutDayInput,
  WorkoutDayRepository,
  WorkoutDayResult,
} from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";

export interface CreateWorkoutDayUseCaseInput {
  planId: string;
  userId: string;
  name: string;
  isRest?: boolean;
  weekDay: CreateWorkoutDayInput["weekDay"];
  estimatedDurationInSeconds?: number | null;
  coverImageUrl?: string | null;
}

export class CreateWorkoutDayUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
  ) {}

  async execute(input: CreateWorkoutDayUseCaseInput): Promise<WorkoutDayResult> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }
    return this.workoutDayRepository.create({
      workoutPlanId: input.planId,
      name: input.name,
      isRest: input.isRest,
      weekDay: input.weekDay,
      estimatedDurationInSeconds: input.estimatedDurationInSeconds,
      coverImageUrl: input.coverImageUrl,
    });
  }
}
