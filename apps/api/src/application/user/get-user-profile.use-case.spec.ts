import { describe, expect, it, vi } from "vitest";

import { UserNotFoundError } from "../../domain/user/errors/user-not-found.error.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";
import { createUserFixture } from "../../test/factories/user.factory.js";
import { GetUserProfileUseCase } from "./get-user-profile.use-case.js";

describe("GetUserProfileUseCase", () => {
  it("should return user profile when user exists", async () => {
    // Given: a user exists in the repository
    const user = createUserFixture({ id: "user-1", name: "Jane Doe", email: "jane@example.com" });
    const userRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue(user),
    };
    const useCase = new GetUserProfileUseCase(userRepository);

    // When: getting profile for that user
    const result = await useCase.execute({ userId: "user-1" });

    // Then: returns the user profile
    expect(result).toEqual(user);
    expect(userRepository.findById).toHaveBeenCalledWith("user-1");
  });

  it("should throw UserNotFoundError when user does not exist", async () => {
    // Given: the repository returns null for the user
    const userRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue(null),
    };
    const useCase = new GetUserProfileUseCase(userRepository);

    // When: getting profile for non-existent user
    // Then: throws UserNotFoundError
    await expect(useCase.execute({ userId: "non-existent" })).rejects.toThrow(
      UserNotFoundError
    );
    await expect(useCase.execute({ userId: "non-existent" })).rejects.toThrow(
      "User not found: non-existent"
    );
  });
});
