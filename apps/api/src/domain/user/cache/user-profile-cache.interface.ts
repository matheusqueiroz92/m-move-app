import type { UserRepositoryFindByIdResult } from "../repositories/user.repository.js";

export interface UserProfileCache {
  get(userId: string): Promise<UserRepositoryFindByIdResult | null>;
  set(
    userId: string,
    profile: UserRepositoryFindByIdResult,
    ttlMs: number,
  ): void;
  invalidate(userId: string): void;
}
