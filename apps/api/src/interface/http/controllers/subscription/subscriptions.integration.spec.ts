import { faker } from "@faker-js/faker";
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

function validUuid(): string {
  return faker.string.uuid();
}

describe("Subscriptions API (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });
  afterEach(async () => {
    await cleanup();
  });

  describe("GET /api/subscriptions/status", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/subscriptions/status",
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 200 and null when user has no subscription", async () => {
      const fixture = createUserFixture({
        id: validUuid(),
        email: "user@sub.test",
        role: "STUDENT",
      });
      await prisma.user.create({
        data: toUserCreateData(fixture),
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/subscriptions/status",
        headers: { "X-Test-User-Id": fixture.id },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toBeNull();
    });
  });

  describe("POST /api/subscriptions/checkout", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/subscriptions/checkout",
        payload: {
          priceId: "price_xxx",
          successUrl: "https://app.test/success",
          cancelUrl: "https://app.test/cancel",
        },
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/subscriptions/portal", () => {
    it("should return 401 when request has no authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/subscriptions/portal",
        payload: { returnUrl: "https://app.test/billing" },
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/subscriptions/webhook", () => {
    it("should return 400 when stripe-signature header is missing", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/subscriptions/webhook",
        headers: { "content-type": "application/json" },
        payload: JSON.stringify({ type: "checkout.session.completed" }),
      });
      expect(response.statusCode).toBe(400);
    });
  });
});
