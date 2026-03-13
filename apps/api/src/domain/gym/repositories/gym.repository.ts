export interface CreateGymInput {
  name: string;
  ownerId: string;
  maxInstructors?: number;
  maxStudents?: number;
}

export interface GymResult {
  id: string;
  name: string;
  ownerId: string;
  maxInstructors: number;
  maxStudents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateGymInput {
  name?: string;
  maxInstructors?: number;
  maxStudents?: number;
  isActive?: boolean;
}

export interface GymRepository {
  create(input: CreateGymInput): Promise<GymResult>;
  findById(id: string): Promise<GymResult | null>;
  findByOwnerId(ownerId: string): Promise<GymResult | null>;
  update(id: string, input: UpdateGymInput): Promise<GymResult | null>;
}
