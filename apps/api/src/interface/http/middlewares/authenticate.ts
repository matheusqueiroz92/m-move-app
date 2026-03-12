import type { FastifyReply, FastifyRequest } from "fastify";

import { auth } from "../../../lib/auth.js";
import { env } from "../../../lib/env.js";

function toHeaders(
  raw: Record<string, string | string[] | undefined>,
): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined)
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  return headers;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // In test env, allow X-Test-User-Id header to simulate authenticated user (no cookie signing).
  if (env.NODE_ENV === "test") {
    const testUserId = request.headers["x-test-user-id"];
    if (typeof testUserId === "string" && testUserId.length > 0) {
      request.userId = testUserId;
      return;
    }
  }

  const headers = toHeaders(request.raw.headers);
  const session = await auth.api.getSession({ headers });

  if (!session?.user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  request.userId = session.user.id;
}
