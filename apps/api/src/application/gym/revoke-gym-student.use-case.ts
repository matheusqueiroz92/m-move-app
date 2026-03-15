import { GymAccessDeniedError } from "../../domain/gym/errors/gym-access-denied.error.js";
import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import { GymStudentLinkNotFoundError } from "../../domain/gym/errors/gym-student-link-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymStudentLinkRepository } from "../../domain/gym/repositories/gym-student-link.repository.js";

export interface RevokeGymStudentInput {
  linkId: string;
  userId: string;
}

/** RN-014: Only OWNER of the gym can revoke a student link. */
export class RevokeGymStudentUseCase {
  constructor(
    private readonly gymStudentLinkRepository: GymStudentLinkRepository,
    private readonly gymRepository: GymRepository,
  ) {}

  async execute(input: RevokeGymStudentInput): Promise<void> {
    const link = await this.gymStudentLinkRepository.findById(input.linkId);
    if (!link) {
      throw new GymStudentLinkNotFoundError(input.linkId);
    }

    const gym = await this.gymRepository.findById(link.gymId);
    if (!gym) {
      throw new GymNotFoundError(link.gymId);
    }
    if (gym.ownerId !== input.userId) {
      throw new GymAccessDeniedError(link.gymId);
    }

    await this.gymStudentLinkRepository.updateStatus(
      input.linkId,
      "REVOKED",
      undefined,
      new Date(),
      undefined,
    );
  }
}
