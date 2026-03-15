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
  /** Check if student is actively linked to gym (RF-002f, RF-002h) */
  hasActiveStudentInGym(gymId: string, studentId: string): Promise<boolean>;
  updateStatus(
    id: string,
    status: LinkStatus,
    acceptedAt?: Date,
    revokedAt?: Date,
    studentId?: string,
  ): Promise<GymStudentLinkResult | null>;
}
