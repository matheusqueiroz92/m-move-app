import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";

export interface ListGymMembersInput {
  gymId: string;
  userId: string;
}

export class ListGymMembersUseCase {
  constructor(
    private readonly gymRepository: GymRepository,
    private readonly gymInstructorRepository: GymInstructorRepository,
  ) {}

  async execute(input: ListGymMembersInput) {
    const gym = await this.gymRepository.findById(input.gymId);
    if (!gym) {
      throw new GymNotFoundError(input.gymId);
    }
    if (gym.ownerId !== input.userId) {
      throw new GymNotFoundError(input.gymId);
    }
    return this.gymInstructorRepository.findByGymId(input.gymId);
  }
}
