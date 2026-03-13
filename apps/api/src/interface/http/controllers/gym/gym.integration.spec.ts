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

describe("Gym API (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  describe("POST /api/gym", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/gym",
        payload: { name: "Academia Test" },
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when user is not OWNER", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "student@gym.test",
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
        url: "/api/gym",
        headers: { "X-Test-User-Id": fixture.id },
        payload: { name: "Academia Test" },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 201 and create gym when user is OWNER", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "owner@gym.test",
        role: "OWNER",
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
        url: "/api/gym",
        headers: { "X-Test-User-Id": fixture.id },
        payload: {
          name: "Academia Alpha",
          maxInstructors: 5,
          maxStudents: 30,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json() as Record<string, unknown>;
      expect(body.name).toBe("Academia Alpha");
      expect(body.ownerId).toBe(fixture.id);
      expect(body.maxInstructors).toBe(5);
      expect(body.maxStudents).toBe(30);
      expect(body.isActive).toBe(true);
    });
  });

  describe("GET /api/gym/:id", () => {
    it("should return 401 when request has no authentication", async () => {
      const id = validUuid();
      const response = await app.inject({
        method: "GET",
        url: `/api/gym/${id}`,
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when gym does not exist", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "user-get@gym.test",
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
      const gymId = validUuid();

      const response = await app.inject({
        method: "GET",
        url: `/api/gym/${gymId}`,
        headers: { "X-Test-User-Id": fixture.id },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 200 and gym when gym exists", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-get@gym.test",
        role: "OWNER",
      });
      await prisma.user.create({
        data: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          emailVerified: owner.emailVerified,
          role: owner.role,
          timezone: owner.timezone,
        },
      });
      const gym = await prisma.gym.create({
        data: {
          name: "Academia Get",
          ownerId: owner.id,
          maxInstructors: 10,
          maxStudents: 50,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/gym/${gym.id}`,
        headers: { "X-Test-User-Id": owner.id },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as Record<string, unknown>;
      expect(body.id).toBe(gym.id);
      expect(body.name).toBe("Academia Get");
    });
  });

  describe("PATCH /api/gym/:id", () => {
    it("should return 403 when user is not OWNER", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-patch@gym.test",
        role: "OWNER",
      });
      const other = createUserFixture({
        id: validUuid(),
        email: "other-patch@gym.test",
        role: "STUDENT",
      });
      await prisma.user.createMany({
        data: [
          {
            id: owner.id,
            name: owner.name,
            email: owner.email,
            emailVerified: owner.emailVerified,
            role: owner.role,
            timezone: owner.timezone,
          },
          {
            id: other.id,
            name: other.name,
            email: other.email,
            emailVerified: other.emailVerified,
            role: other.role,
            timezone: other.timezone,
          },
        ],
      });
      const gym = await prisma.gym.create({
        data: {
          name: "Academia Patch",
          ownerId: owner.id,
        },
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/api/gym/${gym.id}`,
        headers: { "X-Test-User-Id": other.id },
        payload: { name: "Hacked" },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 200 and update gym when user is OWNER", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-update@gym.test",
        role: "OWNER",
      });
      await prisma.user.create({
        data: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          emailVerified: owner.emailVerified,
          role: owner.role,
          timezone: owner.timezone,
        },
      });
      const gym = await prisma.gym.create({
        data: {
          name: "Academia Before",
          ownerId: owner.id,
          maxInstructors: 10,
        },
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/api/gym/${gym.id}`,
        headers: { "X-Test-User-Id": owner.id },
        payload: { name: "Academia After", maxInstructors: 15 },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as Record<string, unknown>;
      expect(body.name).toBe("Academia After");
      expect(body.maxInstructors).toBe(15);
    });
  });

  describe("GET /api/gym/:id/members", () => {
    it("should return 401 when request has no authentication", async () => {
      const id = validUuid();
      const response = await app.inject({
        method: "GET",
        url: `/api/gym/${id}/members`,
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when gym does not exist or user is not owner", async () => {
      const user = createUserFixture({
        id: validUuid(),
        email: "user-members@gym.test",
        role: "STUDENT",
      });
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          timezone: user.timezone,
        },
      });
      const gymId = validUuid();

      const response = await app.inject({
        method: "GET",
        url: `/api/gym/${gymId}/members`,
        headers: { "X-Test-User-Id": user.id },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 200 and list of members when user is OWNER of gym", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-list@gym.test",
        role: "OWNER",
      });
      await prisma.user.create({
        data: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          emailVerified: owner.emailVerified,
          role: owner.role,
          timezone: owner.timezone,
        },
      });
      const gym = await prisma.gym.create({
        data: {
          name: "Academia List",
          ownerId: owner.id,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/gym/${gym.id}/members`,
        headers: { "X-Test-User-Id": owner.id },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as unknown[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(0);
    });
  });

  describe("POST /api/gym/members", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/gym/members",
        payload: { gymId: validUuid(), inviteEmail: "instr@test.dev" },
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when gym does not exist", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-invite@gym.test",
        role: "OWNER",
      });
      await prisma.user.create({
        data: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          emailVerified: owner.emailVerified,
          role: owner.role,
          timezone: owner.timezone,
        },
      });
      const gymId = validUuid();

      const response = await app.inject({
        method: "POST",
        url: "/api/gym/members",
        headers: { "X-Test-User-Id": owner.id },
        payload: { gymId, inviteEmail: "instr@test.dev" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 201 and create instructor invite when OWNER and gym exists", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-invite2@gym.test",
        role: "OWNER",
      });
      await prisma.user.create({
        data: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          emailVerified: owner.emailVerified,
          role: owner.role,
          timezone: owner.timezone,
        },
      });
      const gym = await prisma.gym.create({
        data: {
          name: "Academia Invite",
          ownerId: owner.id,
          maxInstructors: 10,
        },
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/gym/members",
        headers: { "X-Test-User-Id": owner.id },
        payload: { gymId: gym.id, inviteEmail: "instructor@academia.test" },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json() as Record<string, unknown>;
      expect(body.gymId).toBe(gym.id);
      expect(body.inviteEmail).toBe("instructor@academia.test");
      expect(body.status).toBe("PENDING");
    });
  });

  describe("DELETE /api/gym/members/:id", () => {
    it("should return 401 when request has no authentication", async () => {
      const linkId = validUuid();
      const response = await app.inject({
        method: "DELETE",
        url: `/api/gym/members/${linkId}`,
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when link does not exist", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-del@gym.test",
        role: "OWNER",
      });
      await prisma.user.create({
        data: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          emailVerified: owner.emailVerified,
          role: owner.role,
          timezone: owner.timezone,
        },
      });
      const linkId = validUuid();

      const response = await app.inject({
        method: "DELETE",
        url: `/api/gym/members/${linkId}`,
        headers: { "X-Test-User-Id": owner.id },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 204 when OWNER removes instructor link", async () => {
      const owner = createUserFixture({
        id: validUuid(),
        email: "owner-remove@gym.test",
        role: "OWNER",
      });
      await prisma.user.create({
        data: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          emailVerified: owner.emailVerified,
          role: owner.role,
          timezone: owner.timezone,
        },
      });
      const gym = await prisma.gym.create({
        data: {
          name: "Academia Remove",
          ownerId: owner.id,
        },
      });
      const link = await prisma.gymInstructor.create({
        data: {
          gymId: gym.id,
          inviteEmail: "instr@remove.test",
          inviteToken: "token-remove",
          inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/gym/members/${link.id}`,
        headers: { "X-Test-User-Id": owner.id },
      });

      expect(response.statusCode).toBe(204);
    });
  });
});
