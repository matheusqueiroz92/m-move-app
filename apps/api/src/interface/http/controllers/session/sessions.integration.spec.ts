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

describe("POST /api/sessions/start (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/sessions/start",
      payload: { workoutDayId: "some-day-id" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 201 and created session when day belongs to user plan", async () => {
    const fixture = createUserFixture({
      id: "user-sess-1",
      email: "sess@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });
    const plan = await prisma.workoutPlan.create({
      data: { name: "Plano", userId: fixture.id, createdBy: fixture.id },
    });
    const day = await prisma.workoutDay.create({
      data: {
        name: "Dia",
        workoutPlanId: plan.id,
        weekDay: "MONDAY",
        isRest: false,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/sessions/start",
      headers: { "X-Test-User-Id": fixture.id },
      payload: { workoutDayId: day.id },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as {
      id: string;
      userId: string;
      workoutDayId: string;
      startedAt: string;
      completedAt: string | null;
    };
    expect(body.userId).toBe(fixture.id);
    expect(body.workoutDayId).toBe(day.id);
    expect(body.completedAt).toBeNull();
    expect(body.startedAt).toBeDefined();
  });

  it("should return 404 when day does not exist or plan not owned by user", async () => {
    const fixture = createUserFixture({
      id: "user-sess-404",
      email: "sess404@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/sessions/start",
      headers: { "X-Test-User-Id": fixture.id },
      payload: { workoutDayId: "00000000-0000-0000-0000-000000000000" },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("PATCH /api/sessions/:id/complete (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 200 and updated session when session belongs to user", async () => {
    const fixture = createUserFixture({
      id: "user-complete-1",
      email: "complete@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });
    const plan = await prisma.workoutPlan.create({
      data: { name: "Plano", userId: fixture.id, createdBy: fixture.id },
    });
    const day = await prisma.workoutDay.create({
      data: {
        name: "Dia",
        workoutPlanId: plan.id,
        weekDay: "MONDAY",
        isRest: false,
      },
    });
    const session = await prisma.workoutSession.create({
      data: {
        userId: fixture.id,
        workoutDayId: day.id,
        startedAt: new Date(),
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/sessions/${session.id}/complete`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      id: string;
      completedAt: string | null;
    };
    expect(body.completedAt).not.toBeNull();
  });
});

describe("GET /api/sessions/history (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 200 and array of sessions for authenticated user", async () => {
    const fixture = createUserFixture({
      id: "user-hist-1",
      email: "hist@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/sessions/history",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
  });
});

describe("GET /api/sessions/streak (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 200 and streak for authenticated user", async () => {
    const fixture = createUserFixture({
      id: "user-streak-1",
      email: "streak@test.dev",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(fixture),
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/sessions/streak",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { streak: number };
    expect(typeof body.streak).toBe("number");
    expect(body.streak).toBeGreaterThanOrEqual(0);
  });
});
