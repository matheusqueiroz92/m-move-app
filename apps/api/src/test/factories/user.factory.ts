import { faker } from "@faker-js/faker";

export type UserFixtureOverrides = Partial<{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role:
    | "OWNER"
    | "PERSONAL_TRAINER"
    | "INSTRUCTOR"
    | "STUDENT"
    | "LINKED_STUDENT";
  planType: "STUDENT" | "PERSONAL" | "GYM" | null;
  subscriptionStatus:
    | "ACTIVE"
    | "TRIALING"
    | "PAST_DUE"
    | "CANCELED"
    | "UNPAID"
    | null;
  timezone: string;
}>;

export type UserFixture = ReturnType<typeof createUserFixture>;

/**
 * Returns a minimal user-like object for tests (Prisma create or mocks).
 * Override any field via the second argument.
 */
export function createUserFixture(overrides: UserFixtureOverrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    emailVerified: false,
    image: null,
    role: "STUDENT" as const,
    planType: "STUDENT" as const,
    subscriptionStatus: "ACTIVE" as const,
    timezone: "America/Sao_Paulo",
    ...overrides,
  };
}

const ROLES_REQUIRING_ACTIVE_PLAN = [
  "STUDENT",
  "OWNER",
  "PERSONAL_TRAINER",
] as const;

/**
 * Returns Prisma User create data from a fixture, with planType and subscriptionStatus
 * set so that requireActivePlan middleware allows access (RF-004).
 * Use this in integration tests when the user will call routes protected by requireActivePlan.
 */
export function toUserCreateData(fixture: UserFixture): {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  timezone: string;
  planType: "STUDENT" | "PERSONAL" | "GYM" | null;
  subscriptionStatus:
    | "ACTIVE"
    | "TRIALING"
    | "PAST_DUE"
    | "CANCELED"
    | "UNPAID"
    | null;
} {
  const needsPlan = ROLES_REQUIRING_ACTIVE_PLAN.includes(
    fixture.role as (typeof ROLES_REQUIRING_ACTIVE_PLAN)[number],
  );
  const planType =
    fixture.planType ??
    (fixture.role === "OWNER"
      ? "GYM"
      : fixture.role === "PERSONAL_TRAINER"
        ? "PERSONAL"
        : needsPlan
          ? "STUDENT"
          : null);
  const subscriptionStatus =
    fixture.subscriptionStatus ?? (needsPlan ? "ACTIVE" : null);
  return {
    id: fixture.id,
    name: fixture.name,
    email: fixture.email,
    emailVerified: fixture.emailVerified,
    role: fixture.role,
    timezone: fixture.timezone,
    planType,
    subscriptionStatus,
  };
}
