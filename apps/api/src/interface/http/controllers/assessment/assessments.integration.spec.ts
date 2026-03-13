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

describe("GET /api/assessments (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/assessments",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and empty array when user has no assessments", async () => {
    const fixture = createUserFixture({
      id: "user-assess-list",
      email: "assess-list@test.dev",
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
      url: "/api/assessments",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });

  it("should return 200 and list of assessments when user has assessments", async () => {
    const fixture = createUserFixture({
      id: "user-assess-list2",
      email: "assess-list2@test.dev",
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
    await prisma.physicalAssessment.create({
      data: {
        userId: fixture.id,
        weightKg: 80,
        heightCm: 175,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/assessments",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Array<{ id: string; userId: string; weightKg: number; heightCm: number }>;
    expect(body).toHaveLength(1);
    expect(body[0]?.userId).toBe(fixture.id);
    expect(body[0]?.weightKg).toBe(80);
    expect(body[0]?.heightCm).toBe(175);
  });
});

describe("POST /api/assessments (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/assessments",
      payload: { weightKg: 80, heightCm: 175 },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 201 and created assessment when body is valid", async () => {
    const fixture = createUserFixture({
      id: "user-assess-create",
      email: "assess-create@test.dev",
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
      url: "/api/assessments",
      headers: { "X-Test-User-Id": fixture.id },
      payload: {
        weightKg: 82,
        heightCm: 176,
        bodyFatPct: 18,
        notes: "Primeira avaliação",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as {
      id: string;
      userId: string;
      weightKg: number;
      heightCm: number;
      notes: string | null;
    };
    expect(body.userId).toBe(fixture.id);
    expect(body.weightKg).toBe(82);
    expect(body.heightCm).toBe(176);
    expect(body.notes).toBe("Primeira avaliação");
  });
});

describe("GET /api/assessments/:id (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/assessments/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 when assessment belongs to user", async () => {
    const fixture = createUserFixture({
      id: "user-assess-get",
      email: "assess-get@test.dev",
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
    const assessment = await prisma.physicalAssessment.create({
      data: {
        userId: fixture.id,
        weightKg: 80,
        heightCm: 175,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/assessments/${assessment.id}`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { id: string; userId: string };
    expect(body.id).toBe(assessment.id);
    expect(body.userId).toBe(fixture.id);
  });

  it("should return 404 when assessment does not exist", async () => {
    const fixture = createUserFixture({
      id: "user-assess-404",
      email: "assess-404@test.dev",
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
      url: "/api/assessments/b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(404);
  });

  it("should return 403 when assessment belongs to another user and requester is not assessor", async () => {
    const owner = createUserFixture({
      id: "user-owner",
      email: "owner@test.dev",
      role: "STUDENT",
    });
    const other = createUserFixture({
      id: "user-other",
      email: "other@test.dev",
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
    const assessment = await prisma.physicalAssessment.create({
      data: {
        userId: owner.id,
        weightKg: 80,
        heightCm: 175,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/assessments/${assessment.id}`,
      headers: { "X-Test-User-Id": other.id },
    });

    expect(response.statusCode).toBe(403);
  });
});

describe("GET /api/assessments/history/:userId (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/assessments/history/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and list when userId is the authenticated user", async () => {
    const fixture = createUserFixture({
      id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      email: "history@test.dev",
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
    await prisma.physicalAssessment.create({
      data: {
        userId: fixture.id,
        weightKg: 80,
        heightCm: 175,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/assessments/history/${fixture.id}`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Array<{ userId: string }>;
    expect(body).toHaveLength(1);
    expect(body[0]?.userId).toBe(fixture.id);
  });

  it("should return 403 when userId is not the authenticated user", async () => {
    const fixture = createUserFixture({
      id: "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
      email: "history403@test.dev",
      role: "STUDENT",
    });
    const otherId = "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55";
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
      url: `/api/assessments/history/${otherId}`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(403);
  });
});
