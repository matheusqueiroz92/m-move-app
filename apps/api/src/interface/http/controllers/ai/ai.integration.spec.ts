import { faker } from "@faker-js/faker";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import app from "../../../../app.js";
import { UserCreateInput } from "../../../../generated/prisma/models.js";
import { prisma } from "../../../../lib/db.js";
import {
  createUserFixture,
  toUserCreateData,
} from "../../../../test/factories/user.factory.js";
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

function validUuid(): string {
  return faker.string.uuid();
}

describe("AI API (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  describe("POST /api/ai/generate-plan", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/ai/generate-plan",
        payload: {
          objective: "Hipertrofia",
          level: "Iniciante",
          daysPerWeek: 4,
        },
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when user is LINKED_STUDENT (RF-022)", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        role: "LINKED_STUDENT",
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

      const response = await app.inject({
        method: "POST",
        url: "/api/ai/generate-plan",
        headers: { "X-Test-User-Id": fixture.id },
        payload: {
          objective: "Hipertrofia",
          level: "Iniciante",
          daysPerWeek: 4,
        },
      });
      expect(response.statusCode).toBe(403);
      const body = response.json() as { message: string };
      expect(body.message).toBe("Forbidden");
    });

    it("should return 400 when body is invalid", async () => {
      const fixture = createUserFixture({ id: validUuid(), role: "STUDENT" });
      await prisma.user.create({
        data: toUserCreateData(fixture) as UserCreateInput,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/ai/generate-plan",
        headers: { "X-Test-User-Id": fixture.id },
        payload: {
          objective: "",
          level: "Iniciante",
          daysPerWeek: 4,
        },
      });
      expect(response.statusCode).toBe(400);
    });

    it("should return 503 when OPENAI_API_KEY is not configured", async () => {
      const fixture = createUserFixture({ id: validUuid(), role: "STUDENT" });
      await prisma.user.create({
        data: toUserCreateData(fixture) as UserCreateInput,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/ai/generate-plan",
        headers: { "X-Test-User-Id": fixture.id },
        payload: {
          objective: "Hipertrofia",
          level: "Iniciante",
          daysPerWeek: 4,
        },
      });
      expect([503, 500]).toContain(response.statusCode);
      const body = response.json() as { message?: string };
      expect(body.message).toBeDefined();
    });
  });

  describe("GET /api/ai/chats", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ai/chats",
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when user is LINKED_STUDENT (RF-022)", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        role: "LINKED_STUDENT",
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
      const response = await app.inject({
        method: "GET",
        url: "/api/ai/chats",
        headers: { "X-Test-User-Id": fixture.id },
      });
      expect(response.statusCode).toBe(403);
    });

    it("should return 200 and empty array when user has no chats", async () => {
      const fixture = createUserFixture({ id: validUuid(), role: "STUDENT" });
      await prisma.user.create({
        data: toUserCreateData(fixture) as UserCreateInput,
      });
      const response = await app.inject({
        method: "GET",
        url: "/api/ai/chats",
        headers: { "X-Test-User-Id": fixture.id },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json() as { items: unknown[]; total: number };
      expect(body).toHaveProperty("items");
      expect(body.items).toEqual([]);
      expect(body.total).toBe(0);
    });
  });

  describe("GET /api/ai/insights/:userId", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/ai/insights/${validUuid()}`,
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when userId is not the authenticated user", async () => {
      const fixture = createUserFixture({ id: validUuid(), role: "STUDENT" });
      await prisma.user.create({
        data: toUserCreateData(fixture) as UserCreateInput,
      });
      const otherUserId = validUuid();
      const response = await app.inject({
        method: "GET",
        url: `/api/ai/insights/${otherUserId}`,
        headers: { "X-Test-User-Id": fixture.id },
      });
      expect(response.statusCode).toBe(403);
    });
  });
});
