/**
 * Runs Prisma migrate deploy against the test database.
 * Loads .env.test and sets DATABASE_URL from TEST_DATABASE_URL so Prisma uses the test DB.
 * Usage: pnpm db:test:migrate (from apps/api)
 */
import { execSync } from "node:child_process";
import { resolve } from "node:path";

import { config } from "dotenv";

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
execSync("pnpm exec prisma migrate deploy", {
  stdio: "inherit",
  env: process.env,
});
