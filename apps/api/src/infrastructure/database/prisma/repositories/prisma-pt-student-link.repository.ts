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

  async findByPersonalTrainerId(ptId: string): Promise<PtStudentLinkResult[]> {
    const links = await prisma.pTStudentLink.findMany({
      where: { personalTrainerId: ptId },
      orderBy: { createdAt: "desc" },
    });
    return links.map(toPtStudentLinkResult);
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
