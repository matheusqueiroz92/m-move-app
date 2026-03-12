/**
 * Tipos e DTOs compartilhados (contratos da API).
 * Uso: backend (respostas/requests) e frontend (chamadas à API).
 */

// Re-export enums de constants para conveniência
export type {
  AIChatRole,
  LinkStatus,
  PlanType,
  SubscriptionStatus,
  UserRole,
  WeekDay,
} from "@m-move-app/constants";

// --- User ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

// --- Workout Plan ---
export interface WorkoutPlanResponse {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdBy: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Workout Day ---
export interface WorkoutDayResponse {
  id: string;
  name: string;
  workoutPlanId: string;
  isRest: boolean;
  weekDay: string;
  estimatedDurationInSeconds: number | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Workout Exercise ---
export interface WorkoutExerciseResponse {
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
  createdAt: string;
  updatedAt: string;
}

// --- Paginação ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
