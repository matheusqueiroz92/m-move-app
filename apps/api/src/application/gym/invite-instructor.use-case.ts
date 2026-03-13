import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import { InstructorLimitReachedError } from "../../domain/gym/errors/instructor-limit-reached.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";

export interface InviteInstructorInput {
  gymId: string;
  ownerId: string;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
}

export class InviteInstructorUseCase {
  constructor(
    private readonly gymRepository: GymRepository,
    private readonly gymInstructorRepository: GymInstructorRepository,
  ) {}

  async execute(input: InviteInstructorInput) {
    const gym = await this.gymRepository.findById(input.gymId);
    if (!gym || gym.ownerId !== input.ownerId) {
      throw new GymNotFoundError(input.gymId);
    }

    const count = await this.gymInstructorRepository.countActiveByGymId(
      input.gymId,
    );
    if (count >= gym.maxInstructors) {
      throw new InstructorLimitReachedError(input.gymId, gym.maxInstructors);
    }

    return this.gymInstructorRepository.create({
      gymId: input.gymId,
      inviteEmail: input.inviteEmail,
      inviteToken: input.inviteToken,
      inviteExpiresAt: input.inviteExpiresAt,
    });
  }
}
