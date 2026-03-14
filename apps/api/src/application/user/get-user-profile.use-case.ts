import { UserNotFoundError } from "../../domain/user/errors/user-not-found.error.js";
import type {
  UserRepository,
  UserRepositoryFindByIdResult,
} from "../../domain/user/repositories/user.repository.js";
import type { UserProfileCache } from "../../domain/user/cache/user-profile-cache.interface.js";

export interface GetUserProfileInput {
  userId: string;
}

export type GetUserProfileResult = UserRepositoryFindByIdResult;

const DEFAULT_PROFILE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class GetUserProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileCache?: UserProfileCache,
  ) {}

  async execute(input: GetUserProfileInput): Promise<GetUserProfileResult> {
    const cached = this.profileCache
      ? await this.profileCache.get(input.userId)
      : null;
    if (cached) return cached;

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    if (this.profileCache) {
      this.profileCache.set(input.userId, user, DEFAULT_PROFILE_TTL_MS);
    }
    return user;
  }
}
