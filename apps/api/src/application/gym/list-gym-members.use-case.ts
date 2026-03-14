import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type { GymRepository } from "../../domain/gym/repositories/gym.repository.js";
import type {
  GymInstructorRepository,
  GymInstructorResult,
} from "../../domain/gym/repositories/gym-instructor.repository.js";

export interface ListGymMembersInput {
  gymId: string;
  userId: string;
  limit: number;
  offset: number;
}

export interface ListGymMembersResult {
  items: GymInstructorResult[];
  total: number;
  limit: number;
  offset: number;
}

export class ListGymMembersUseCase {
  constructor(
    private readonly gymRepository: GymRepository,
    private readonly gymInstructorRepository: GymInstructorRepository,
  ) {}

  async execute(input: ListGymMembersInput): Promise<ListGymMembersResult> {
    const gym = await this.gymRepository.findById(input.gymId);
    if (!gym) {
      throw new GymNotFoundError(input.gymId);
    }
    if (gym.ownerId !== input.userId) {
      throw new GymNotFoundError(input.gymId);
    }
    const { items, total } =
      await this.gymInstructorRepository.findByGymIdPaginated(input.gymId, {
        limit: input.limit,
        offset: input.offset,
      });
    return {
      items,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }
}
