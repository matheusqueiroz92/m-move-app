export interface CreateWorkoutPlanInput {
  userId: string;
  name: string;
  description?: string | null;
  createdBy?: string | null;
}

export interface CreateWorkoutPlanExerciseInput {
  name: string;
  order: number;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  description?: string | null;
  notes?: string | null;
}

export interface CreateWorkoutPlanDayInput {
  name: string;
  isRest: boolean;
  weekDay: string;
  estimatedDurationInSeconds?: number | null;
  exercises: CreateWorkoutPlanExerciseInput[];
}

export interface CreateWorkoutPlanFullInput {
  userId: string;
  name: string;
  description?: string | null;
  createdBy?: string | null;
  days: CreateWorkoutPlanDayInput[];
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
  createWithDaysAndExercises(
    input: CreateWorkoutPlanFullInput,
  ): Promise<WorkoutPlanResult>;
  findByUserId(userId: string): Promise<WorkoutPlanResult[]>;
  findByIdAndUserId(planId: string, userId: string): Promise<WorkoutPlanResult | null>;
  deactivateAllByUserId(userId: string): Promise<void>;
  updateIsActive(planId: string, userId: string, isActive: boolean): Promise<WorkoutPlanResult | null>;
  /** Desativa todos os planos do usuário e ativa o planId em uma transação atômica. */
  activatePlanForUser(planId: string, userId: string): Promise<WorkoutPlanResult | null>;
}
