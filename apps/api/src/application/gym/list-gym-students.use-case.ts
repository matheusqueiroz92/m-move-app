import { GymAccessDeniedError } from "../../domain/gym/errors/gym-access-denied.error.js";
import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type { GymInstructorRepository } from "../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type {
  GymStudentLinkListItem,
  GymStudentLinkRepository,
} from "../../domain/gym/repositories/gym-student-link.repository.js";

export interface ListGymStudentsInput {
  gymId: string;
  userId: string;
  limit: number;
  offset: number;
}

export interface ListGymStudentsResult {
  items: GymStudentLinkListItem[];
  total: number;
  limit: number;
  offset: number;
}

/** OWNER sees all students; INSTRUCTOR sees only students with instructorId = their link. */
export class ListGymStudentsUseCase {
  constructor(
    private readonly gymRepository: GymRepository,
    private readonly gymInstructorRepository: GymInstructorRepository,
    private readonly gymStudentLinkRepository: GymStudentLinkRepository,
  ) {}

  async execute(input: ListGymStudentsInput): Promise<ListGymStudentsResult> {
    const gym = await this.gymRepository.findById(input.gymId);
    if (!gym) {
      throw new GymNotFoundError(input.gymId);
    }

    let instructorIdFilter: string | null = null;

    if (gym.ownerId === input.userId) {
      instructorIdFilter = null;
    } else {
      const instructorLink =
        await this.gymInstructorRepository.findActiveByGymIdAndInstructorUserId(
          input.gymId,
          input.userId,
        );
      if (!instructorLink) {
        throw new GymAccessDeniedError(input.gymId);
      }
      instructorIdFilter = instructorLink.id;
    }

    const { items, total } =
      await this.gymStudentLinkRepository.findByGymIdPaginated(
        input.gymId,
        { limit: input.limit, offset: input.offset },
        instructorIdFilter,
      );

    return {
      items,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }
}
