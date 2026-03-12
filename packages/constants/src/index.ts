/**
 * Enums e constantes compartilhados (API e frontend).
 * Espelham os enums do Prisma para uso fora do ORM.
 */

export const USER_ROLES = [
  "OWNER",
  "PERSONAL_TRAINER",
  "INSTRUCTOR",
  "STUDENT",
  "LINKED_STUDENT",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PLAN_TYPES = ["STUDENT", "PERSONAL", "GYM"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

export const SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
  "UNPAID",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const WEEK_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const LINK_STATUSES = [
  "PENDING",
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
] as const;
export type LinkStatus = (typeof LINK_STATUSES)[number];

export const AI_CHAT_ROLES = ["USER", "ASSISTANT", "SYSTEM"] as const;
export type AIChatRole = (typeof AI_CHAT_ROLES)[number];

/** Timezone padrão para cálculos de streak e datas */
export const DEFAULT_TIMEZONE = "America/Sao_Paulo";
