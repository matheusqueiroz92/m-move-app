import type {
  CreateWorkoutPlanInput,
  WorkoutPlanRepository,
  WorkoutPlanResult,
} from "../../domain/workout/repositories/workout-plant.repository.js";

export class CreateWorkoutPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: CreateWorkoutPlanInput): Promise<WorkoutPlanResult> {
    return this.workoutPlanRepository.create({
      userId: input.userId,
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
    });
  }
}
