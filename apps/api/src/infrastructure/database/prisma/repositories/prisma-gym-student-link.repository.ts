import type {
  CreateGymStudentLinkInput,
  GymStudentLinkRepository,
  GymStudentLinkResult,
} from "../../../../domain/gym/repositories/gym-student-link.repository.js";
import { prisma } from "../../../../lib/db.js";
import {
  toGymStudentLinkListItem,
  toGymStudentLinkResult,
} from "../mappers/gym-student-link.mapper.js";

export class PrismaGymStudentLinkRepository implements GymStudentLinkRepository {
  async create(
    input: CreateGymStudentLinkInput,
  ): Promise<GymStudentLinkResult> {
    const link = await prisma.gymStudentLink.create({
      data: {
        gymId: input.gymId,
        instructorId: input.instructorId ?? undefined,
        inviteEmail: input.inviteEmail,
        inviteToken: input.inviteToken,
        inviteExpiresAt: input.inviteExpiresAt,
      },
    });
    return toGymStudentLinkResult(link);
  }

  async findById(id: string): Promise<GymStudentLinkResult | null> {
    const link = await prisma.gymStudentLink.findUnique({
      where: { id },
    });
    return link ? toGymStudentLinkResult(link) : null;
  }

  async hasActiveStudentInGym(
    gymId: string,
    studentId: string,
  ): Promise<boolean> {
    const count = await prisma.gymStudentLink.count({
      where: {
        gymId,
        studentId,
        status: "ACTIVE",
      },
    });
    return count > 0;
  }

  async countActiveByGymId(gymId: string): Promise<number> {
    return prisma.gymStudentLink.count({
      where: { gymId, status: "ACTIVE" },
    });
  }

  async findByGymIdPaginated(
    gymId: string,
    options: { limit: number; offset: number },
    instructorId?: string | null,
  ) {
    const where = {
      gymId,
      ...(instructorId != null && instructorId !== "" && { instructorId }),
    };
    const [items, total] = await Promise.all([
      prisma.gymStudentLink.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options.limit,
        skip: options.offset,
        include: {
          student: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.gymStudentLink.count({ where }),
    ]);
    return {
      items: items.map(toGymStudentLinkListItem),
      total,
    };
  }

  async findByToken(token: string): Promise<GymStudentLinkResult | null> {
    const link = await prisma.gymStudentLink.findUnique({
      where: { inviteToken: token },
    });
    return link ? toGymStudentLinkResult(link) : null;
  }

  async setInstructorIdNullForInstructorLinkId(
    gymInstructorLinkId: string,
  ): Promise<void> {
    await prisma.gymStudentLink.updateMany({
      where: { instructorId: gymInstructorLinkId },
      data: { instructorId: null },
    });
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
