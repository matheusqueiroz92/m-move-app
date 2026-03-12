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

describe("GET /api/workout-days/:dayId/exercises (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workout-days/some-day-id/exercises",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and array of exercises when day belongs to user plan", async () => {
    const fixture = createUserFixture({
      id: "user-ex-1",
      email: "ex@test.dev",
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
    await prisma.workoutExercise.create({
      data: {
        name: "Supino",
        order: 0,
        workoutDayId: day.id,
        sets: 3,
        reps: 10,
        restTimeInSeconds: 60,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/workout-days/${day.id}/exercises`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Array<{ id: string; name: string; order: number }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0]?.name).toBe("Supino");
    expect(body[0]?.order).toBe(0);
  });

  it("should return 404 when day does not exist or plan not owned by user", async () => {
    const fixture = createUserFixture({
      id: "user-ex-404",
      email: "ex404@test.dev",
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
      url: "/api/workout-days/00000000-0000-0000-0000-000000000000/exercises",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("POST /api/workout-days/:dayId/exercises (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 201 and created exercise when day belongs to user plan", async () => {
    const fixture = createUserFixture({
      id: "user-create-ex",
      email: "createex@test.dev",
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
      url: `/api/workout-days/${day.id}/exercises`,
      headers: { "X-Test-User-Id": fixture.id },
      payload: {
        name: "Agachamento",
        order: 0,
        sets: 4,
        reps: 12,
        restTimeInSeconds: 90,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as {
      id: string;
      name: string;
      order: number;
      workoutDayId: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    };
    expect(body.name).toBe("Agachamento");
    expect(body.workoutDayId).toBe(day.id);
    expect(body.sets).toBe(4);
    expect(body.reps).toBe(12);
    expect(body.restTimeInSeconds).toBe(90);
  });
});
