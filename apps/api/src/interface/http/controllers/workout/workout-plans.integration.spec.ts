import { afterEach, beforeEach, describe, expect, it } from "vitest";

import app from "../../../../app.js";
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

describe("POST /api/workout-plans (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 403 when user is LINKED_STUDENT (RF-019)", async () => {
    const fixture = createUserFixture({
      id: "user-linked-create",
      email: "linked-create@test.dev",
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
      url: "/api/workout-plans",
      headers: { "X-Test-User-Id": fixture.id },
      payload: { name: "Tentativa de criar plano" },
    });

    expect(response.statusCode).toBe(403);
    const body = response.json() as { message: string };
    expect(body.message).toBe("Forbidden");
  });
});

describe("PATCH /api/workout-plans/:id (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/api/workout-plans/some-plan-id",
      payload: { name: "Novo Nome" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and updated plan when plan belongs to user", async () => {
    const fixture = createUserFixture({
      id: "user-patch-1",
      email: "patch@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });
    const plan = await prisma.workoutPlan.create({
      data: {
        name: "Plano Original",
        description: "Desc original",
        userId: fixture.id,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/workout-plans/${plan.id}`,
      headers: { "X-Test-User-Id": fixture.id },
      payload: { name: "Plano Atualizado", description: "Nova desc" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      id: string;
      name: string;
      description: string | null;
    };
    expect(body.name).toBe("Plano Atualizado");
    expect(body.description).toBe("Nova desc");
    expect(body.id).toBe(plan.id);
  });

  it("should return 403 when user is LINKED_STUDENT (RF-019)", async () => {
    const fixture = createUserFixture({
      id: "user-linked-patch",
      email: "linked-patch@test.dev",
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
    const plan = await prisma.workoutPlan.create({
      data: {
        name: "Plano do aluno",
        userId: fixture.id,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/workout-plans/${plan.id}`,
      headers: { "X-Test-User-Id": fixture.id },
      payload: { name: "Tentativa de editar" },
    });

    expect(response.statusCode).toBe(403);
    const body = response.json() as { message: string };
    expect(body.message).toBe("Forbidden");
  });

  it("should return 404 when plan does not exist or does not belong to user", async () => {
    const fixture = createUserFixture({
      id: "user-patch-404",
      email: "patch404@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });

    const response = await app.inject({
      method: "PATCH",
      url: "/api/workout-plans/00000000-0000-0000-0000-000000000000",
      headers: { "X-Test-User-Id": fixture.id },
      payload: { name: "Qualquer" },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /api/workout-plans/:id (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/workout-plans/some-plan-id",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 204 and delete plan when plan belongs to user", async () => {
    const fixture = createUserFixture({
      id: "user-del-1",
      email: "del@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });
    const plan = await prisma.workoutPlan.create({
      data: {
        name: "Plano para deletar",
        userId: fixture.id,
      },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/api/workout-plans/${plan.id}`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(204);

    const found = await prisma.workoutPlan.findUnique({
      where: { id: plan.id },
    });
    expect(found).toBeNull();
  });

  it("should return 404 when plan does not exist or does not belong to user", async () => {
    const fixture = createUserFixture({
      id: "user-del-404",
      email: "del404@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });

    const response = await app.inject({
      method: "DELETE",
      url: "/api/workout-plans/00000000-0000-0000-0000-000000000000",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(404);
  });
});
