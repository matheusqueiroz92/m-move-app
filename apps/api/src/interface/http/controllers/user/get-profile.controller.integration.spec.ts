import { afterEach, beforeEach, describe, expect, it } from "vitest";

import app from "../../../../app.js";
import { prisma } from "../../../../lib/db.js";
import { createUserFixture } from "../../../../test/factories/user.factory.js";
import {
  truncateTestDatabase,
  truncateUserTable,
} from "../../../../test/helpers/db.js";

async function cleanup(): Promise<void> {
  try {
    await truncateTestDatabase();
  } catch {
    await truncateUserTable();
  }
}

// Tests that create/query users require the test DB to have the schema (run: pnpm prisma migrate dev then pnpm db:test:migrate).

describe("GET /api/users/me (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    // Given: app is ready, no cookie nor X-Test-User-Id header
    // When: GET /api/users/me
    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
    });

    // Then: unauthorized
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and user profile when authenticated user exists", async () => {
    // Given: a user in the database
    const fixture = createUserFixture({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "Matheus Queiroz",
      email: "teste@matheusqueiroz.dev.br",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: {
        id: fixture.id,
        name: fixture.name,
        email: fixture.email,
        emailVerified: fixture.emailVerified,
        role: fixture.role,
        timezone: fixture.timezone,
      },
    });

    // When: GET /api/users/me with X-Test-User-Id (simulated auth in test)
    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
      headers: {
        "X-Test-User-Id": fixture.id,
      },
    });

    // Then: success and profile body
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    expect(body.id).toBe(fixture.id);
    expect(body.name).toBe(fixture.name);
    expect(body.email).toBe(fixture.email);
    expect(body.role).toBe(fixture.role);
  });

  it("should return 404 when authenticated userId does not exist in database", async () => {
    // Given: no user in DB, but request has X-Test-User-Id (e.g. deleted user)
    const nonExistentId = "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22";

    // When: GET /api/users/me with X-Test-User-Id that does not exist
    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
      headers: {
        "X-Test-User-Id": nonExistentId,
      },
    });

    // Then: not found
    expect(response.statusCode).toBe(404);
  });
});
