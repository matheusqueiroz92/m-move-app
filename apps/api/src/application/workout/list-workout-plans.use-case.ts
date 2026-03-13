import type {
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plan.repository.js";

export interface ListWorkoutPlansInput {
  userId: string;
}

export class ListWorkoutPlansUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: ListWorkoutPlansInput): Promise<WorkoutPlanResult[]> {
    return this.workoutPlanRepository.findByUserId(input.userId);
  }
}
