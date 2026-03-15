import type {
  CreatePtStudentLinkInput,
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../../../domain/pt-invite/repositories/pt-student-link.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toPtStudentLinkResult } from "../mappers/pt-student-link.mapper.js";

export class PrismaPtStudentLinkRepository implements PtStudentLinkRepository {
  async create(input: CreatePtStudentLinkInput): Promise<PtStudentLinkResult> {
    const link = await prisma.pTStudentLink.create({
      data: {
        personalTrainerId: input.personalTrainerId,
        inviteEmail: input.inviteEmail,
        inviteToken: input.inviteToken,
        inviteExpiresAt: input.inviteExpiresAt,
      },
    });
    return toPtStudentLinkResult(link);
  }

  async findById(id: string): Promise<PtStudentLinkResult | null> {
    const link = await prisma.pTStudentLink.findUnique({
      where: { id },
    });
    return link ? toPtStudentLinkResult(link) : null;
  }

  async findByToken(token: string): Promise<PtStudentLinkResult | null> {
    const link = await prisma.pTStudentLink.findUnique({
      where: { inviteToken: token },
    });
    return link ? toPtStudentLinkResult(link) : null;
  }

  async countActiveByPersonalTrainerId(ptId: string): Promise<number> {
    return prisma.pTStudentLink.count({
      where: { personalTrainerId: ptId, status: "ACTIVE" },
    });
  }

  async findByPersonalTrainerId(ptId: string): Promise<PtStudentLinkResult[]> {
    const links = await prisma.pTStudentLink.findMany({
      where: { personalTrainerId: ptId },
      orderBy: { createdAt: "desc" },
    });
    return links.map(toPtStudentLinkResult);
  }

  async findByPersonalTrainerIdPaginated(
    ptId: string,
    options: { limit: number; offset: number },
  ) {
    const [items, total] = await Promise.all([
      prisma.pTStudentLink.findMany({
        where: { personalTrainerId: ptId },
        orderBy: { createdAt: "desc" },
        take: options.limit,
        skip: options.offset,
      }),
      prisma.pTStudentLink.count({ where: { personalTrainerId: ptId } }),
    ]);
    return {
      items: items.map(toPtStudentLinkResult),
      total,
    };
  }

  async updateStatus(
    id: string,
    status: "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED",
    acceptedAt?: Date,
    revokedAt?: Date,
    studentId?: string,
  ): Promise<PtStudentLinkResult | null> {
    const existing = await prisma.pTStudentLink.findUnique({
      where: { id },
    });
    if (!existing) return null;

    const link = await prisma.pTStudentLink.update({
      where: { id },
      data: {
        status,
        ...(acceptedAt !== undefined && { acceptedAt }),
        ...(revokedAt !== undefined && { revokedAt }),
        ...(studentId !== undefined && { studentId }),
      },
    });
    return toPtStudentLinkResult(link);
  }
}
