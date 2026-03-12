import { faker } from "@faker-js/faker";

export type GymFixtureOverrides = Partial<{
  id: string;
  name: string;
  ownerId: string;
  maxInstructors: number;
  maxStudents: number;
  isActive: boolean;
}>;

/**
 * Returns a minimal gym-like object for tests (Prisma create or mocks).
 * Override any field via the second argument. Pass ownerId when creating via Prisma.
 */
export function createGymFixture(overrides: GymFixtureOverrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    ownerId: "", // must be set when creating in DB
    maxInstructors: 10,
    maxStudents: 50,
    isActive: true,
    ...overrides,
  };
}
