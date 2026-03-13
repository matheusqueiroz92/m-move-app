import type { UserRepositoryFindByIdResult } from "../../../../domain/user/repositories/user.repository.js";
import type { User } from "../../../../generated/prisma/client.js";

export function toUserProfile(
  user: Pick<User, "id" | "name" | "email" | "role">,
): UserRepositoryFindByIdResult {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
