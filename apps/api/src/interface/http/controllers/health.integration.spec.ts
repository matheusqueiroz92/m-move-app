import { beforeEach, describe, expect, it } from "vitest";

import app from "../../../app.js";
// For tests that write to DB, import truncateTestDatabase from test/helpers/db and call it in afterEach.

describe("GET /health (integration)", () => {
  beforeEach(async () => {
    await app.ready();
  });

  it("should return 200 with status ok and database connected when DB is healthy", async () => {
    // Given: app is ready and using test database
    // When: GET /health
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    // Then: response is ok with database connected
    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; database: string };
    expect(body.status).toBe("ok");
    expect(body.database).toBe("connected");
  });
});
