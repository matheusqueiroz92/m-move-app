import type { FastifyRequest } from "fastify";

import type { UseCases } from "../../composition-root.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }

  interface FastifyInstance {
    useCases: UseCases;
  }
}
