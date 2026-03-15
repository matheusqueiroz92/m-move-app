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

export interface CreateGymStudentLinkInput {
  gymId: string;
  instructorId?: string | null;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
}

/** List item with optional student name/email when link is accepted */
export interface GymStudentLinkListItem extends GymStudentLinkResult {
  studentName?: string | null;
  studentEmail?: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface GymStudentLinkRepository {
  create(input: CreateGymStudentLinkInput): Promise<GymStudentLinkResult>;
  findById(id: string): Promise<GymStudentLinkResult | null>;
  findByGymIdPaginated(
    gymId: string,
    options: { limit: number; offset: number },
    instructorId?: string | null,
  ): Promise<PaginatedResult<GymStudentLinkListItem>>;
  findByToken(token: string): Promise<GymStudentLinkResult | null>;
  /** Check if student is actively linked to gym (RF-002f, RF-002h) */
  hasActiveStudentInGym(gymId: string, studentId: string): Promise<boolean>;
  /** RN-012: Count active students in gym for limit check */
  countActiveByGymId(gymId: string): Promise<number>;
  /** RN-016: Set instructorId to null for all student links when instructor is removed */
  setInstructorIdNullForInstructorLinkId(
    gymInstructorLinkId: string,
  ): Promise<void>;
  updateStatus(
    id: string,
    status: LinkStatus,
    acceptedAt?: Date,
    revokedAt?: Date,
    studentId?: string,
  ): Promise<GymStudentLinkResult | null>;
}
