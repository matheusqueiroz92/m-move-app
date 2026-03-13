import type {
  CreateGymInput,
  GymRepository,
  GymResult,
} from "../../domain/gym/repositories/gym.repository.js";

export class CreateGymUseCase {
  constructor(private readonly gymRepository: GymRepository) {}

  async execute(input: CreateGymInput): Promise<GymResult> {
    return this.gymRepository.create({
      name: input.name,
      ownerId: input.ownerId,
      maxInstructors: input.maxInstructors,
      maxStudents: input.maxStudents,
    });
  }
}
