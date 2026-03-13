import type { WeekDay } from "@m-move-app/constants";

export interface GeneratedWorkoutPlanParams {
  objective: string;
  level: string;
  daysPerWeek: number;
  equipment?: string[];
  restrictions?: string;
  userId: string;
}

export interface GeneratedWorkoutExercise {
  name: string;
  order: number;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  description?: string | null;
  notes?: string | null;
}

export interface GeneratedWorkoutDay {
  name: string;
  isRest: boolean;
  weekDay: WeekDay;
  estimatedDurationInSeconds?: number | null;
  exercises: GeneratedWorkoutExercise[];
}

export interface GeneratedWorkoutPlan {
  name: string;
  description: string | null;
  days: GeneratedWorkoutDay[];
}

export interface OpenAIPlanProvider {
  generateWorkoutPlan(
    params: GeneratedWorkoutPlanParams,
  ): Promise<GeneratedWorkoutPlan>;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenAIChatProvider {
  chat(messages: ChatMessage[]): Promise<string>;
}

export interface OpenAIInsightsProvider {
  getInsights(userId: string): Promise<string>;
}
