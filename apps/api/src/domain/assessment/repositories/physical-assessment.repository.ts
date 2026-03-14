export interface CreatePhysicalAssessmentInput {
  userId: string;
  assessedBy?: string | null;
  weightKg: number;
  heightCm: number;
  bodyFatPct?: number | null;
  muscleMassPct?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  leftArmCm?: number | null;
  rightArmCm?: number | null;
  leftThighCm?: number | null;
  rightThighCm?: number | null;
  notes?: string | null;
}

export interface PhysicalAssessmentResult {
  id: string;
  userId: string;
  assessedBy: string | null;
  weightKg: number;
  heightCm: number;
  bodyFatPct: number | null;
  muscleMassPct: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  leftArmCm: number | null;
  rightArmCm: number | null;
  leftThighCm: number | null;
  rightThighCm: number | null;
  notes: string | null;
  assessedAt: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface PhysicalAssessmentRepository {
  create(input: CreatePhysicalAssessmentInput): Promise<PhysicalAssessmentResult>;
  findById(id: string): Promise<PhysicalAssessmentResult | null>;
  findByUserId(userId: string): Promise<PhysicalAssessmentResult[]>;
  findByUserIdPaginated(
    userId: string,
    options: { limit: number; offset: number },
  ): Promise<PaginatedResult<PhysicalAssessmentResult>>;
}
