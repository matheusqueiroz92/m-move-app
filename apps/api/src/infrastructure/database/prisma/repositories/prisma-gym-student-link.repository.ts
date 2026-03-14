import type {
  GymStudentLinkRepository,
  GymStudentLinkResult,
} from "../../../../domain/gym/repositories/gym-student-link.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toGymStudentLinkResult } from "../mappers/gym-student-link.mapper.js";

export class PrismaGymStudentLinkRepository
  implements GymStudentLinkRepository
{
  async findByToken(token: string): Promise<GymStudentLinkResult | null> {
    const link = await prisma.gymStudentLink.findUnique({
      where: { inviteToken: token },
    });
    return link ? toGymStudentLinkResult(link) : null;
  }

  async updateStatus(
    id: string,
    status: "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED",
    acceptedAt?: Date,
    revokedAt?: Date,
    studentId?: string,
  ): Promise<GymStudentLinkResult | null> {
    const existing = await prisma.gymStudentLink.findUnique({
      where: { id },
    });
    if (!existing) return null;

    const link = await prisma.gymStudentLink.update({
      where: { id },
      data: {
        status,
        ...(acceptedAt !== undefined && { acceptedAt }),
        ...(revokedAt !== undefined && { revokedAt }),
        ...(studentId !== undefined && { studentId }),
      },
    });
    return toGymStudentLinkResult(link);
  }
}
