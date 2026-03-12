import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z, ZodError } from "zod";

import { DayNotFoundError } from "./domain/workout/errors/day-not-found.error.js";
import { ExerciseNotFoundError } from "./domain/workout/errors/exercise-not-found.error.js";
import { PlanNotFoundError } from "./domain/workout/errors/plan-not-found.error.js";
import { SessionNotFoundError } from "./domain/workout/errors/session-not-found.error.js";
import { UserNotFoundError } from "./domain/user/errors/user-not-found.error.js";
import { sessionRoutes } from "./interface/http/routes/session.routes.js";
import { userRoutes } from "./interface/http/routes/user.routes.js";
import { workoutDaysRoutes } from "./interface/http/routes/workout-days.routes.js";
import { workoutRoutes } from "./interface/http/routes/workout.routes.js";
import { auth } from "./lib/auth.js";

const healthResponseSchema = z.object({ status: z.string() });

const app = fastify({
  logger: true,
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

await app.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  credentials: true,
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

await app.register(userRoutes, { prefix: "/api/users" });
await app.register(workoutRoutes, { prefix: "/api/workout-plans" });
await app.register(workoutDaysRoutes, { prefix: "/api/workout-days" });
await app.register(sessionRoutes, { prefix: "/api/sessions" });

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

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.flatten().fieldErrors,
    });
  }

  if (error instanceof UserNotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof PlanNotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof DayNotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof ExerciseNotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof SessionNotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  app.log.error(error);
  return reply.status(500).send({ message: "Internal server error" });
});

export default app;
