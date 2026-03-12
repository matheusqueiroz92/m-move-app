import { DayNotFoundError } from "../../domain/workout/errors/day-not-found.error.js";
import { PlanNotFoundError } from "../../domain/workout/errors/plan-not-found.error.js";
import type {
  UpdateWorkoutDayInput,
  WorkoutDayRepository,
  WorkoutDayResult,
} from "../../domain/workout/repositories/workout-day.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plant.repository.js";

export interface UpdateWorkoutDayUseCaseInput {
  planId: string;
  dayId: string;
  userId: string;
  name?: string;
  isRest?: boolean;
  weekDay?: UpdateWorkoutDayInput["weekDay"];
  estimatedDurationInSeconds?: number | null;
  coverImageUrl?: string | null;
}

export class UpdateWorkoutDayUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutDayRepository: WorkoutDayRepository,
  ) {}

  async execute(input: UpdateWorkoutDayUseCaseInput): Promise<WorkoutDayResult> {
    const plan = await this.workoutPlanRepository.findByIdAndUserId(
      input.planId,
      input.userId,
    );
    if (!plan) {
      throw new PlanNotFoundError(input.planId);
    }
    const updated = await this.workoutDayRepository.update(
      input.dayId,
      input.planId,
      {
        name: input.name,
        isRest: input.isRest,
        weekDay: input.weekDay,
        estimatedDurationInSeconds: input.estimatedDurationInSeconds,
        coverImageUrl: input.coverImageUrl,
      },
    );
    if (!updated) {
      throw new DayNotFoundError(input.dayId);
    }
    return updated;
  }
}
