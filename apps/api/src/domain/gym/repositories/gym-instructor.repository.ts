export interface CreateGymInstructorInput {
  gymId: string;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
}

export interface GymInstructorResult {
  id: string;
  gymId: string;
  instructorId: string | null;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
  status: "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface GymInstructorRepository {
  create(input: CreateGymInstructorInput): Promise<GymInstructorResult>;
  /** Get gymId for an active instructor link (RF-002f) */
  findActiveGymIdByInstructorId(instructorId: string): Promise<string | null>;
  /** Get active instructor link by gym and instructor user id (for send invite / list students) */
  findActiveByGymIdAndInstructorUserId(
    gymId: string,
    instructorUserId: string,
  ): Promise<GymInstructorResult | null>;
  findById(id: string): Promise<GymInstructorResult | null>;
  findByGymId(gymId: string): Promise<GymInstructorResult[]>;
  findByGymIdPaginated(
    gymId: string,
    options: { limit: number; offset: number },
  ): Promise<PaginatedResult<GymInstructorResult>>;
  countActiveByGymId(gymId: string): Promise<number>;
  delete(id: string): Promise<boolean>;
}
