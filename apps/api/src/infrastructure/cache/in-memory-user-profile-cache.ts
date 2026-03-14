import type { UserProfileCache } from "../../domain/user/cache/user-profile-cache.interface.js";
import type { UserRepositoryFindByIdResult } from "../../domain/user/repositories/user.repository.js";

interface CacheEntry {
  profile: UserRepositoryFindByIdResult;
  expiresAt: number;
}

export class InMemoryUserProfileCache implements UserProfileCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  async get(userId: string): Promise<UserRepositoryFindByIdResult | null> {
    const entry = this.store.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(userId);
      return null;
    }
    return entry.profile;
  }

  set(
    userId: string,
    profile: UserRepositoryFindByIdResult,
    ttlMs = this.defaultTtlMs,
  ): void {
    this.store.set(userId, {
      profile,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(userId: string): void {
    this.store.delete(userId);
  }
}
