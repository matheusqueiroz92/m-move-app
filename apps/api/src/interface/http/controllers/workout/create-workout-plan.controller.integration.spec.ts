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

describe("POST /api/workout-plans (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/workout-plans",
      payload: { name: "Plano A", description: "Descrição" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 201 and created plan when authenticated with valid body", async () => {
    const fixture = createUserFixture({
      id: "user-create-plan-1",
      name: "User Plan",
      email: "plan@test.dev",
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
      url: "/api/workout-plans",
      headers: { "X-Test-User-Id": fixture.id },
      payload: { name: "Meu Plano", description: "Descrição do plano" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as {
      id: string;
      name: string;
      description: string | null;
      userId: string;
      createdBy: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    expect(body.name).toBe("Meu Plano");
    expect(body.description).toBe("Descrição do plano");
    expect(body.userId).toBe(fixture.id);
    expect(body.isActive).toBe(false);
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("should return 400 when body is invalid (missing name)", async () => {
    const fixture = createUserFixture({
      id: "user-invalid-1",
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
      url: "/api/workout-plans",
      headers: { "X-Test-User-Id": fixture.id },
      payload: { description: "Só descrição" },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("GET /api/workout-plans (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    try {
      await truncateTestDatabase();
    } catch {
      await truncateUserTable();
    }
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workout-plans",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and array of plans when authenticated", async () => {
    const fixture = createUserFixture({
      id: "user-list-1",
      email: "list@test.dev",
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
    await prisma.workoutPlan.create({
      data: {
        name: "Plano 1",
        description: "Desc 1",
        userId: fixture.id,
        createdBy: fixture.id,
      },
    });
    await prisma.workoutPlan.create({
      data: {
        name: "Plano 2",
        userId: fixture.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/workout-plans",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Array<{
      id: string;
      name: string;
      description: string | null;
      userId: string;
      isActive: boolean;
    }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
    expect(body.map((p) => p.name).sort()).toEqual(["Plano 1", "Plano 2"]);
    expect(body.every((p) => p.userId === fixture.id)).toBe(true);
  });

  it("should return 200 and empty array when user has no plans", async () => {
    const fixture = createUserFixture({
      id: "user-empty-plans",
      email: "empty@test.dev",
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
      url: "/api/workout-plans",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});

describe("GET /api/workout-plans/:id (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    try {
      await truncateTestDatabase();
    } catch {
      await truncateUserTable();
    }
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workout-plans/some-id",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and plan when plan belongs to user", async () => {
    const fixture = createUserFixture({
      id: "user-get-plan-1",
      email: "getplan@test.dev",
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
    const plan = await prisma.workoutPlan.create({
      data: {
        name: "Plano Único",
        description: "Desc",
        userId: fixture.id,
        createdBy: fixture.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/workout-plans/${plan.id}`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      id: string;
      name: string;
      userId: string;
    };
    expect(body.id).toBe(plan.id);
    expect(body.name).toBe("Plano Único");
    expect(body.userId).toBe(fixture.id);
  });

  it("should return 404 when plan does not exist", async () => {
    const fixture = createUserFixture({
      id: "user-404-1",
      email: "404@test.dev",
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
      url: "/api/workout-plans/00000000-0000-0000-0000-000000000000",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(404);
  });

  it("should return 404 when plan belongs to another user", async () => {
    const owner = createUserFixture({
      id: "owner-1",
      email: "owner@test.dev",
      role: "STUDENT",
    });
    const other = createUserFixture({
      id: "other-1",
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
    const plan = await prisma.workoutPlan.create({
      data: {
        name: "Plano do Dono",
        userId: owner.id,
        createdBy: owner.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/workout-plans/${plan.id}`,
      headers: { "X-Test-User-Id": other.id },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("POST /api/workout-plans/:id/activate (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    try {
      await truncateTestDatabase();
    } catch {
      await truncateUserTable();
    }
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/workout-plans/some-id/activate",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and activated plan, and deactivate other plans", async () => {
    const fixture = createUserFixture({
      id: "user-activate-1",
      email: "activate@test.dev",
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
    const plan1 = await prisma.workoutPlan.create({
      data: {
        name: "Plano 1",
        userId: fixture.id,
        isActive: true,
      },
    });
    const plan2 = await prisma.workoutPlan.create({
      data: {
        name: "Plano 2",
        userId: fixture.id,
        isActive: false,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/workout-plans/${plan2.id}/activate`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      id: string;
      name: string;
      isActive: boolean;
    };
    expect(body.id).toBe(plan2.id);
    expect(body.name).toBe("Plano 2");
    expect(body.isActive).toBe(true);

    const [p1, p2] = await Promise.all([
      prisma.workoutPlan.findUnique({ where: { id: plan1.id } }),
      prisma.workoutPlan.findUnique({ where: { id: plan2.id } }),
    ]);
    expect(p1?.isActive).toBe(false);
    expect(p2?.isActive).toBe(true);
  });

  it("should return 404 when plan does not exist", async () => {
    const fixture = createUserFixture({
      id: "user-act-404",
      email: "act404@test.dev",
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
      url: "/api/workout-plans/00000000-0000-0000-0000-000000000000/activate",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(404);
  });
});
