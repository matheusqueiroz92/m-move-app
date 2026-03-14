export type LinkStatus = "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";

export interface GymStudentLinkResult {
  id: string;
  gymId: string;
  instructorId: string | null;
  studentId: string | null;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
  status: LinkStatus;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface GymStudentLinkRepository {
  findByToken(token: string): Promise<GymStudentLinkResult | null>;
  updateStatus(
    id: string,
    status: LinkStatus,
    acceptedAt?: Date,
    revokedAt?: Date,
    studentId?: string,
  ): Promise<GymStudentLinkResult | null>;
}
