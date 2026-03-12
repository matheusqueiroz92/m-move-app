import type { UserRepository, UserRepositoryFindByIdResult } from "../../../../domain/user/repositories/user.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toUserProfile } from "../mappers/user.mapper.js";

export class PrismaUserRepository implements UserRepository {
  async findById(userId: string): Promise<UserRepositoryFindByIdResult | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return user ? toUserProfile(user) : null;
  }
}
