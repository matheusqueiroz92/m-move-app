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

describe("POST /api/gym/accept-invite (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should return 401 when request has no authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/gym/accept-invite",
      payload: { token: "some-token" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and link when token is valid and pending", async () => {
    const owner = createUserFixture({
      id: "owner-gym-1",
      email: "owner@gym.test",
      role: "OWNER",
    });
    const student = createUserFixture({
      id: "student-gym-1",
      email: "student@gym.test",
      role: "STUDENT",
    });
    await prisma.user.createMany({
      data: [toUserCreateData(owner), toUserCreateData(student)],
    });
    const gym = await prisma.gym.create({
      data: {
        name: "Academia Test",
        ownerId: owner.id,
      },
    });
    const expiresAt = new Date(Date.now() + 86400000);
    const link = await prisma.gymStudentLink.create({
      data: {
        gymId: gym.id,
        inviteEmail: student.email,
        inviteToken: "valid-token-123",
        inviteExpiresAt: expiresAt,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/gym/accept-invite",
      headers: { "X-Test-User-Id": student.id },
      payload: { token: "valid-token-123" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      id: string;
      gymId: string;
      studentId: string;
      status: string;
    };
    expect(body.id).toBe(link.id);
    expect(body.gymId).toBe(gym.id);
    expect(body.studentId).toBe(student.id);
    expect(body.status).toBe("ACTIVE");
  });

  it("should return 400 when token is expired or invalid", async () => {
    const student = createUserFixture({
      id: "student-gym-2",
      email: "student2@gym.test",
      role: "STUDENT",
    });
    await prisma.user.create({
      data: toUserCreateData(student),
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/gym/accept-invite",
      headers: { "X-Test-User-Id": student.id },
      payload: { token: "invalid-token" },
    });

    expect(response.statusCode).toBe(400);
  });
});
