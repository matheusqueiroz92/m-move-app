import { GymNotFoundError } from "../../domain/gym/errors/gym-not-found.error.js";
import type {
  GymRepository,
  GymResult,
  UpdateGymInput,
} from "../../domain/gym/repositories/gym.repository.js";

export interface UpdateGymUseCaseInput {
  gymId: string;
  ownerId: string;
  input: UpdateGymInput;
}

export class UpdateGymUseCase {
  constructor(private readonly gymRepository: GymRepository) {}

  async execute({
    gymId,
    ownerId,
    input,
  }: UpdateGymUseCaseInput): Promise<GymResult> {
    const gym = await this.gymRepository.findById(gymId);
    if (!gym || gym.ownerId !== ownerId) {
      throw new GymNotFoundError(gymId);
    }
    const updated = await this.gymRepository.update(gymId, input);
    if (!updated) {
      throw new GymNotFoundError(gymId);
    }
    return updated;
  }
}
