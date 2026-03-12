/**
 * Pushes the Prisma schema to the test database (creates/updates tables without migrations).
 * Use when you have no migrations yet or want to sync the test DB with the current schema.
 * Usage: pnpm db:test:push (from apps/api)
 */
import { config } from "dotenv";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const envTestPath = resolve(process.cwd(), ".env.test");
config({ path: envTestPath });

const testDbUrl = process.env.TEST_DATABASE_URL;
if (!testDbUrl) {
  console.error(
    "TEST_DATABASE_URL is not set. Create .env.test with TEST_DATABASE_URL=postgresql://..."
  );
  process.exit(1);
}

process.env.DATABASE_URL = testDbUrl;
execSync("pnpm exec prisma db push", {
  stdio: "inherit",
  env: process.env,
});
