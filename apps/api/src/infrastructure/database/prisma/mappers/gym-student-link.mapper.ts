import type {
  GymStudentLinkListItem,
  GymStudentLinkResult,
} from "../../../../domain/gym/repositories/gym-student-link.repository.js";
import type { GymStudentLink } from "../../../../generated/prisma/client.js";

export function toGymStudentLinkResult(
  link: GymStudentLink,
): GymStudentLinkResult {
  return {
    id: link.id,
    gymId: link.gymId,
    instructorId: link.instructorId ?? null,
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

export function toGymStudentLinkListItem(
  link: GymStudentLink & { student?: { name: string; email: string } | null },
): GymStudentLinkListItem {
  return {
    ...toGymStudentLinkResult(link),
    studentName: link.student?.name ?? null,
    studentEmail: link.student?.email ?? null,
  };
}
