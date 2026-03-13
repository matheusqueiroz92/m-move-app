/**
 * Vitest setup: runs before all tests.
 * Ensures NODE_ENV is "test" so env validation and DB use test config.
 * Loads .env.test when present so TEST_DATABASE_URL is available for integration tests.
 */
import { resolve } from "node:path";

import { config } from "dotenv";

process.env.NODE_ENV = "test";

const envTestPath = resolve(process.cwd(), ".env.test");
config({ path: envTestPath });
