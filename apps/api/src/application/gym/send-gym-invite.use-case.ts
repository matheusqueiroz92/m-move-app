import { GymAccessDeniedError } from "../../domain/gym/errors/gym-access-denied.error.js";
import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import { StudentLimitReachedError } from "../../domain/gym/errors/student-limit-reached.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type {
  GymStudentLinkRepository,
  GymStudentLinkResult,
} from "../../domain/gym/repositories/gym-student-link.repository.js";

export interface SendGymInviteInput {
  gymId: string;
  inviteEmail: string;
  instructorId?: string | null;
  inviteToken: string;
  inviteExpiresAt: Date;
  userId: string;
}

/** RN-005: OWNER or INSTRUCTOR of the gym can send student invite. RN-012: Respect gym maxStudents. */
export class SendGymInviteUseCase {
  constructor(
    private readonly gymRepository: GymRepository,
    private readonly gymInstructorRepository: GymInstructorRepository,
    private readonly gymStudentLinkRepository: GymStudentLinkRepository,
  ) {}

  async execute(input: SendGymInviteInput): Promise<GymStudentLinkResult> {
    const gym = await this.gymRepository.findById(input.gymId);
    if (!gym) {
      throw new GymNotFoundError(input.gymId);
    }

    let instructorIdForLink: string | null = null;

    if (gym.ownerId === input.userId) {
      if (input.instructorId != null) {
        const instructorLink = await this.gymInstructorRepository.findById(
          input.instructorId,
        );
        if (
          !instructorLink ||
          instructorLink.gymId !== input.gymId ||
          instructorLink.status !== "ACTIVE"
        ) {
          throw new GymNotFoundError(input.gymId);
        }
        instructorIdForLink = input.instructorId;
      }
    } else {
      const instructorLink =
        await this.gymInstructorRepository.findActiveByGymIdAndInstructorUserId(
          input.gymId,
          input.userId,
        );
      if (!instructorLink) {
        throw new GymAccessDeniedError(input.gymId);
      }
      instructorIdForLink = instructorLink.id;
    }

    const activeCount = await this.gymStudentLinkRepository.countActiveByGymId(
      input.gymId,
    );
    if (activeCount >= gym.maxStudents) {
      throw new StudentLimitReachedError(input.gymId, gym.maxStudents);
    }

    return this.gymStudentLinkRepository.create({
      gymId: input.gymId,
      instructorId: instructorIdForLink,
      inviteEmail: input.inviteEmail,
      inviteToken: input.inviteToken,
      inviteExpiresAt: input.inviteExpiresAt,
    });
  }
}
