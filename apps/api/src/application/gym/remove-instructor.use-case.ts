import { InstructorLinkNotFoundError } from "../../domain/gym/errors/instructor-link-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";

export interface RemoveInstructorInput {
  linkId: string;
  ownerId: string;
}

export class RemoveInstructorUseCase {
  constructor(
    private readonly gymRepository: GymRepository,
    private readonly gymInstructorRepository: GymInstructorRepository,
  ) {}

  async execute(input: RemoveInstructorInput): Promise<void> {
    const link = await this.gymInstructorRepository.findById(input.linkId);
    if (!link) {
      throw new InstructorLinkNotFoundError(input.linkId);
    }

    const gym = await this.gymRepository.findById(link.gymId);
    if (!gym || gym.ownerId !== input.ownerId) {
      throw new InstructorLinkNotFoundError(input.linkId);
    }

    await this.gymInstructorRepository.delete(input.linkId);
  }
}
