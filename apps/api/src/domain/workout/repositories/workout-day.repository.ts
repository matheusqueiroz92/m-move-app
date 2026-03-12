export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface CreateWorkoutDayInput {
  workoutPlanId: string;
  name: string;
  isRest?: boolean;
  weekDay: WeekDay;
  estimatedDurationInSeconds?: number | null;
  coverImageUrl?: string | null;
}

export interface UpdateWorkoutDayInput {
  name?: string;
  isRest?: boolean;
  weekDay?: WeekDay;
  estimatedDurationInSeconds?: number | null;
  coverImageUrl?: string | null;
}

export interface WorkoutDayResult {
  id: string;
  name: string;
  workoutPlanId: string;
  isRest: boolean;
  weekDay: string;
  estimatedDurationInSeconds: number | null;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutDayRepository {
  create(input: CreateWorkoutDayInput): Promise<WorkoutDayResult>;
  findByPlanId(workoutPlanId: string): Promise<WorkoutDayResult[]>;
  findByIdAndPlanId(dayId: string, workoutPlanId: string): Promise<WorkoutDayResult | null>;
  update(dayId: string, workoutPlanId: string, input: UpdateWorkoutDayInput): Promise<WorkoutDayResult | null>;
  delete(dayId: string, workoutPlanId: string): Promise<boolean>;
}
