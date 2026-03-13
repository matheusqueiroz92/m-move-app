export type AIChatRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface CreateAIChatInput {
  userId: string;
  title?: string | null;
}

export interface AIChatResult {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIChatRepository {
  create(input: CreateAIChatInput): Promise<AIChatResult>;
  findById(id: string): Promise<AIChatResult | null>;
  findByUserId(userId: string): Promise<AIChatResult[]>;
}
