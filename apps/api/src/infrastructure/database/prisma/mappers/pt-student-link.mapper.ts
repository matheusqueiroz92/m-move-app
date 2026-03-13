import type { PtStudentLinkResult } from "../../../../domain/pt-invite/repositories/pt-student-link.repository.js";
import type { PTStudentLink } from "../../../../generated/prisma/client.js";

export function toPtStudentLinkResult(
  link: PTStudentLink,
): PtStudentLinkResult {
  return {
    id: link.id,
    personalTrainerId: link.personalTrainerId,
    studentId: link.studentId ?? null,
    inviteEmail: link.inviteEmail,
    inviteToken: link.inviteToken,
    inviteExpiresAt: link.inviteExpiresAt,
    status: link.status,
    acceptedAt: link.acceptedAt ?? null,
    revokedAt: link.revokedAt ?? null,
    createdAt: link.createdAt,
  };
}
