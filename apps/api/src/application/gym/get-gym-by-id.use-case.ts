import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type {
  GymRepository,
  GymResult,
} from "../../domain/gym/repositories/gym.repository.js";

export interface GetGymByIdInput {
  id: string;
}

export class GetGymByIdUseCase {
  constructor(private readonly gymRepository: GymRepository) {}

  async execute(input: GetGymByIdInput): Promise<GymResult> {
    const gym = await this.gymRepository.findById(input.id);
    if (!gym) {
      throw new GymNotFoundError(input.id);
    }
    return gym;
  }
}
