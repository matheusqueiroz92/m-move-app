import { randomUUID } from "node:crypto";

import fastifyCors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";

import {
  aiChatMessageRepository,
  useCases,
  userRepository,
} from "./composition-root.js";
import { apiRoutesPlugin } from "./interface/http/plugins/api-routes.plugin.js";
import { auth } from "./lib/auth.js";
import { prisma } from "./lib/db.js";
import { env } from "./lib/env.js";

const healthResponseSchema = z.object({ status: z.string() });

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    formatters: {
      level: (label) => ({ level: label }),
    },
    serializers: {
      req: (req: { method: string; url: string; id: string }) => ({
        method: req.method,
        url: req.url,
        requestId: req.id,
      }),
      err: (err: Error & { type?: string }) => ({
        type: err.type ?? "Error",
        message: err.message,
        stack: err.stack ?? "",
      }),
    },
  },
  genReqId: (req) => {
    const id = req.headers["x-request-id"];
    return (Array.isArray(id) ? id[0] : id) ?? randomUUID();
  },
  requestIdLogLabel: "requestId",
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "M Move API",
      description: "API for the M Move application",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Localhost",
        url: "http://localhost:3001",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

await app.register(fastifyCors, {
  origin: corsOrigins,
  credentials: true,
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "M Move API",
        slug: "m-move-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/health",
  schema: {
    response: {
      200: healthResponseSchema,
    },
  },
  handler: async () => ({ status: "ok" }),
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

app.decorate("useCases", useCases);
app.decorate("userRepository", userRepository);
app.decorate("aiChatMessageRepository", aiChatMessageRepository);

app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

await app.register(apiRoutesPlugin);

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http:${request.headers.host}`);

      const headers = new Headers();

      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH FAILURE",
      });
    }
  },
});

export default app;
