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

describe("GET /api/workout-plans/:planId/days (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workout-plans/some-plan-id/days",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and array of days when plan belongs to user", async () => {
    const fixture = createUserFixture({
      id: "user-days-1",
      email: "days@test.dev",
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
        name: "Plano",
        userId: fixture.id,
        createdBy: fixture.id,
      },
    });
    await prisma.workoutDay.create({
      data: {
        name: "Dia 1",
        workoutPlanId: plan.id,
        weekDay: "MONDAY",
        isRest: false,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/workout-plans/${plan.id}/days`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Array<{
      id: string;
      name: string;
      weekDay: string;
    }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0]?.name).toBe("Dia 1");
    expect(body[0]?.weekDay).toBe("MONDAY");
  });

  it("should return 404 when plan does not exist or does not belong to user", async () => {
    const fixture = createUserFixture({
      id: "user-days-404",
      email: "days404@test.dev",
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
      url: "/api/workout-plans/00000000-0000-0000-0000-000000000000/days",
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("POST /api/workout-plans/:planId/days (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/workout-plans/some-plan-id/days",
      payload: { name: "Dia A", weekDay: "MONDAY" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 201 and created day when plan belongs to user", async () => {
    const fixture = createUserFixture({
      id: "user-create-day-1",
      email: "createday@test.dev",
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
        name: "Plano",
        userId: fixture.id,
        createdBy: fixture.id,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/workout-plans/${plan.id}/days`,
      headers: { "X-Test-User-Id": fixture.id },
      payload: {
        name: "Treino A",
        weekDay: "TUESDAY",
        isRest: false,
        estimatedDurationInSeconds: 3600,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as {
      id: string;
      name: string;
      workoutPlanId: string;
      weekDay: string;
      isRest: boolean;
      estimatedDurationInSeconds: number | null;
    };
    expect(body.name).toBe("Treino A");
    expect(body.workoutPlanId).toBe(plan.id);
    expect(body.weekDay).toBe("TUESDAY");
    expect(body.isRest).toBe(false);
    expect(body.estimatedDurationInSeconds).toBe(3600);
  });

  it("should return 404 when plan does not belong to user", async () => {
    const owner = createUserFixture({
      id: "owner-d",
      email: "owner-d@test.dev",
      role: "STUDENT",
    });
    const other = createUserFixture({
      id: "other-d",
      email: "other-d@test.dev",
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
      data: { name: "Plano Owner", userId: owner.id, createdBy: owner.id },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/workout-plans/${plan.id}/days`,
      headers: { "X-Test-User-Id": other.id },
      payload: { name: "Dia", weekDay: "WEDNESDAY" },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("PATCH /api/workout-plans/:planId/days/:dayId (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 200 and updated day when plan and day belong to user", async () => {
    const fixture = createUserFixture({
      id: "user-patch-day",
      email: "patchday@test.dev",
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
        name: "Dia Original",
        workoutPlanId: plan.id,
        weekDay: "MONDAY",
        isRest: false,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/workout-plans/${plan.id}/days/${day.id}`,
      headers: { "X-Test-User-Id": fixture.id },
      payload: { name: "Dia Atualizado", isRest: true },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { name: string; isRest: boolean };
    expect(body.name).toBe("Dia Atualizado");
    expect(body.isRest).toBe(true);
  });

  it("should return 404 when day does not exist", async () => {
    const fixture = createUserFixture({
      id: "user-patch-404",
      email: "patch404@test.dev",
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

    const response = await app.inject({
      method: "PATCH",
      url: `/api/workout-plans/${plan.id}/days/00000000-0000-0000-0000-000000000000`,
      headers: { "X-Test-User-Id": fixture.id },
      payload: { name: "Novo Nome" },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /api/workout-plans/:planId/days/:dayId (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should return 204 when day is deleted", async () => {
    const fixture = createUserFixture({
      id: "user-del-day",
      email: "delday@test.dev",
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
      method: "DELETE",
      url: `/api/workout-plans/${plan.id}/days/${day.id}`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(204);
    const stillExists = await prisma.workoutDay.findUnique({
      where: { id: day.id },
    });
    expect(stillExists).toBeNull();
  });

  it("should return 404 when day does not exist", async () => {
    const fixture = createUserFixture({
      id: "user-del-404",
      email: "del404@test.dev",
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

    const response = await app.inject({
      method: "DELETE",
      url: `/api/workout-plans/${plan.id}/days/00000000-0000-0000-0000-000000000000`,
      headers: { "X-Test-User-Id": fixture.id },
    });

    expect(response.statusCode).toBe(404);
  });
});
