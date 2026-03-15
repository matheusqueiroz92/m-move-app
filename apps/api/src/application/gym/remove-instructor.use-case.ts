import { InstructorLinkNotFoundError } from "../../domain/gym/errors/instructor-link-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymStudentLinkRepository } from "../../domain/gym/repositories/gym-student-link.repository.js";
import type { WorkoutPlanRepository } from "../../domain/workout/repositories/workout-plan.repository.js";

export interface RemoveInstructorInput {
  linkId: string;
  ownerId: string;
}

/**
 * RN-016: When instructor is removed, their linked students are reassigned to OWNER (instructorId → null).
 * RN-17: WorkoutPlans created by the instructor are reassigned to OWNER (createdBy → ownerId).
 */
export class RemoveInstructorUseCase {
  constructor(
    private readonly gymRepository: GymRepository,
    private readonly gymInstructorRepository: GymInstructorRepository,
    private readonly gymStudentLinkRepository: GymStudentLinkRepository,
    private readonly workoutPlanRepository: WorkoutPlanRepository,
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

    await this.gymStudentLinkRepository.setInstructorIdNullForInstructorLinkId(
      input.linkId,
    );

    if (link.instructorId) {
      await this.workoutPlanRepository.reassignCreatedBy(
        link.instructorId,
        gym.ownerId,
      );
    }

    await this.gymInstructorRepository.delete(input.linkId);
  }
}
