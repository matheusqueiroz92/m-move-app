import { UserNotFoundError } from "../../domain/user/errors/user-not-found.error.js";
import type {
  UserRepository,
  UserRepositoryFindByIdResult,
} from "../../domain/user/repositories/user.repository.js";

export interface GetUserProfileInput {
  userId: string;
}

export type GetUserProfileResult = UserRepositoryFindByIdResult;

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetUserProfileInput): Promise<GetUserProfileResult> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UserNotFoundError(input.userId);
    }
    return user;
  }
}
