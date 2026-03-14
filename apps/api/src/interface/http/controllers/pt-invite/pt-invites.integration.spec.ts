import { faker } from "@faker-js/faker";
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

function validUuid(): string {
  return faker.string.uuid();
}

describe("PT Invites API (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  describe("POST /api/pt/invites", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/pt/invites",
        payload: { inviteEmail: "aluno@test.dev" },
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when user is not PERSONAL_TRAINER", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "student@pt.test",
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

      const response = await app.inject({
        method: "POST",
        url: "/api/pt/invites",
        headers: { "X-Test-User-Id": fixture.id },
        payload: { inviteEmail: "aluno@test.dev" },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 201 and create invite when user is PERSONAL_TRAINER", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "pt@invite.test",
        role: "PERSONAL_TRAINER",
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
        url: "/api/pt/invites",
        headers: { "X-Test-User-Id": fixture.id },
        payload: { inviteEmail: "aluno@academia.test" },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json() as Record<string, unknown>;
      expect(body.personalTrainerId).toBe(fixture.id);
      expect(body.inviteEmail).toBe("aluno@academia.test");
      expect(body.status).toBe("PENDING");
      expect(body.inviteToken).toBeDefined();
    });
  });

  describe("GET /api/pt/invites", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/pt/invites",
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when user is not PERSONAL_TRAINER", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "student@list.test",
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

      const response = await app.inject({
        method: "GET",
        url: "/api/pt/invites",
        headers: { "X-Test-User-Id": fixture.id },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 200 and list invites when user is PERSONAL_TRAINER", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "pt@list.test",
        role: "PERSONAL_TRAINER",
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
        url: "/api/pt/invites",
        headers: { "X-Test-User-Id": fixture.id },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as { items: unknown[]; total: number };
      expect(body).toHaveProperty("items");
      expect(body.items).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  describe("POST /api/pt/invites/accept", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/pt/invites/accept",
        payload: { token: "some-token" },
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 400 when token is invalid or expired", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "student@accept.test",
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

      const response = await app.inject({
        method: "POST",
        url: "/api/pt/invites/accept",
        headers: { "X-Test-User-Id": fixture.id },
        payload: { token: validUuid() },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 200 and accept invite when token is valid", async () => {
      const pt = createUserFixture({
        id: validUuid(),
        email: "pt@accept.test",
        role: "PERSONAL_TRAINER",
      });
      const student = createUserFixture({
        id: validUuid(),
        email: "student@accept2.test",
        role: "STUDENT",
      });
      await prisma.user.createMany({
        data: [
          {
            id: pt.id,
            name: pt.name,
            email: pt.email,
            emailVerified: pt.emailVerified,
            role: pt.role,
            timezone: pt.timezone,
          },
          {
            id: student.id,
            name: student.name,
            email: student.email,
            emailVerified: student.emailVerified,
            role: student.role,
            timezone: student.timezone,
          },
        ],
      });
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const link = await prisma.pTStudentLink.create({
        data: {
          personalTrainerId: pt.id,
          inviteEmail: student.email,
          inviteToken: "accept-token-valid",
          inviteExpiresAt: expiresAt,
        },
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/pt/invites/accept",
        headers: { "X-Test-User-Id": student.id },
        payload: { token: "accept-token-valid" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as Record<string, unknown>;
      expect(body.id).toBe(link.id);
      expect(body.status).toBe("ACTIVE");
      expect(body.studentId).toBe(student.id);
    });
  });

  describe("DELETE /api/pt/invites/:id", () => {
    it("should return 401 when request has no authentication", async () => {
      const id = validUuid();
      const response = await app.inject({
        method: "DELETE",
        url: `/api/pt/invites/${id}`,
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when invite does not exist", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "pt@revoke.test",
        role: "PERSONAL_TRAINER",
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
      const inviteId = validUuid();

      const response = await app.inject({
        method: "DELETE",
        url: `/api/pt/invites/${inviteId}`,
        headers: { "X-Test-User-Id": fixture.id },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 204 when PERSONAL_TRAINER revokes own invite", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "pt@revoke2.test",
        role: "PERSONAL_TRAINER",
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
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const link = await prisma.pTStudentLink.create({
        data: {
          personalTrainerId: fixture.id,
          inviteEmail: "aluno@revoke.test",
          inviteToken: "revoke-token",
          inviteExpiresAt: expiresAt,
        },
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/pt/invites/${link.id}`,
        headers: { "X-Test-User-Id": fixture.id },
      });

      expect(response.statusCode).toBe(204);
    });
  });
});
