export interface CreateWorkoutExerciseInput {
  workoutDayId: string;
  name: string;
  order: number;
  description?: string | null;
  sets: number;
  reps: number;
  weightKg?: number | null;
  restTimeInSeconds: number;
  notes?: string | null;
}

export interface UpdateWorkoutExerciseInput {
  name?: string;
  order?: number;
  description?: string | null;
  sets?: number;
  reps?: number;
  weightKg?: number | null;
  restTimeInSeconds?: number;
  notes?: string | null;
}

export interface WorkoutExerciseResult {
  id: string;
  name: string;
  order: number;
  workoutDayId: string;
  description: string | null;
  sets: number;
  reps: number;
  weightKg: number | null;
  restTimeInSeconds: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExerciseRepository {
  create(input: CreateWorkoutExerciseInput): Promise<WorkoutExerciseResult>;
  findByDayId(workoutDayId: string): Promise<WorkoutExerciseResult[]>;
  findByIdAndDayId(exerciseId: string, workoutDayId: string): Promise<WorkoutExerciseResult | null>;
  update(exerciseId: string, workoutDayId: string, input: UpdateWorkoutExerciseInput): Promise<WorkoutExerciseResult | null>;
  delete(exerciseId: string, workoutDayId: string): Promise<boolean>;
  reorder(workoutDayId: string, exerciseIdsInOrder: string[]): Promise<WorkoutExerciseResult[]>;
}
