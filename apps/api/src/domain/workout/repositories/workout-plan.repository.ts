export interface CreateWorkoutPlanInput {
  userId: string;
  name: string;
  description?: string | null;
  createdBy?: string | null;
}

export interface WorkoutPlanResult {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdBy: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutPlanRepository {
  create(input: CreateWorkoutPlanInput): Promise<WorkoutPlanResult>;
  findByUserId(userId: string): Promise<WorkoutPlanResult[]>;
  findByIdAndUserId(planId: string, userId: string): Promise<WorkoutPlanResult | null>;
  deactivateAllByUserId(userId: string): Promise<void>;
  updateIsActive(planId: string, userId: string, isActive: boolean): Promise<WorkoutPlanResult | null>;
}
