import { faker } from "@faker-js/faker";

export type UserFixtureOverrides = Partial<{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "OWNER" | "PERSONAL_TRAINER" | "INSTRUCTOR" | "STUDENT" | "LINKED_STUDENT";
  planType: "STUDENT" | "PERSONAL" | "GYM" | null;
  timezone: string;
}>;

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
    timezone: "America/Sao_Paulo",
    ...overrides,
  };
}
