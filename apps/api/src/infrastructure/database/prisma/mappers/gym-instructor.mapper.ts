import type { GymInstructorResult } from "../../../../domain/gym/repositories/gym-instructor.repository.js";
import type { GymInstructor } from "../../../../generated/prisma/client.js";

export function toGymInstructorResult(
  link: GymInstructor,
): GymInstructorResult {
  return {
    id: link.id,
    gymId: link.gymId,
    instructorId: link.instructorId ?? null,
    inviteEmail: link.inviteEmail,
    inviteToken: link.inviteToken,
    inviteExpiresAt: link.inviteExpiresAt,
    status: link.status,
    acceptedAt: link.acceptedAt ?? null,
    revokedAt: link.revokedAt ?? null,
    createdAt: link.createdAt,
  };
}
