export type LinkStatus = "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";

export interface CreatePtStudentLinkInput {
  personalTrainerId: string;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
}

export interface PtStudentLinkResult {
  id: string;
  personalTrainerId: string;
  studentId: string | null;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
  status: LinkStatus;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface PtStudentLinkRepository {
  create(input: CreatePtStudentLinkInput): Promise<PtStudentLinkResult>;
  findById(id: string): Promise<PtStudentLinkResult | null>;
  findByToken(token: string): Promise<PtStudentLinkResult | null>;
  findByPersonalTrainerId(ptId: string): Promise<PtStudentLinkResult[]>;
  findByPersonalTrainerIdPaginated(
    ptId: string,
    options: { limit: number; offset: number },
  ): Promise<PaginatedResult<PtStudentLinkResult>>;
  updateStatus(
    id: string,
    status: LinkStatus,
    acceptedAt?: Date,
    revokedAt?: Date,
    studentId?: string,
  ): Promise<PtStudentLinkResult | null>;
}
