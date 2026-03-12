import { prisma } from "../../lib/db.js";

/**
 * Tables for truncate (CASCADE handles FK order).
 * Uses Prisma @@map names; reserved words quoted for PostgreSQL.
 */
const TABLES = [
  "ai_chat_message",
  "ai_chat",
  "workout_session",
  "workout_exercise",
  "workout_day",
  "workout_plan",
  "physical_assessment",
  "subscription",
  "gym_student_link",
  "gym_instructor",
  "gym",
  "pt_student_link",
  '"session"',
  "account",
  "verification",
  '"user"',
] as const;

/**
 * Truncates all application tables in the test database.
 * Use in afterEach or afterAll of integration tests to leave DB clean.
 * Requires TEST_DATABASE_URL and NODE_ENV=test.
 */
export async function truncateTestDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.join(", ")} CASCADE`
  );
}
