import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

const NOT_FOUND_ERROR_NAMES = [
  "AssessmentNotFoundError",
  "ChatNotFoundError",
  "GymNotFoundError",
  "InstructorLinkNotFoundError",
  "PtInviteNotFoundError",
  "UserNotFoundError",
  "PlanNotFoundError",
  "DayNotFoundError",
  "ExerciseNotFoundError",
  "SessionNotFoundError",
] as const;

type ErrorWithMeta = Error & {
  name?: string;
  statusCode?: number;
  code?: string;
  constructor?: { name?: string };
};

export function createErrorHandler(
  log: (error: unknown) => void,
): (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => void {
  return (error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Validation error",
        issues: error.flatten().fieldErrors,
      });
    }

    const err = error as ErrorWithMeta;
    const name = err?.name ?? err?.constructor?.name;
    const message = err?.message ?? "";

    if (err.code === "FST_ERR_VALIDATION") {
      return reply.status(400).send({
        message: message || "Validation error",
      });
    }

    if (name && (NOT_FOUND_ERROR_NAMES as readonly string[]).includes(name)) {
      return reply.status(404).send({ message: message || "Not found" });
    }
    if (/not found/i.test(message)) {
      return reply.status(404).send({ message: message || "Not found" });
    }

    if (
      name === "InviteExpiredError" ||
      name === "InviteAlreadyUsedError" ||
      /expired|already used|revoked/i.test(message)
    ) {
      return reply.status(400).send({ message: message || "Bad request" });
    }
    if (
      message === "Invalid signature" ||
      /no Stripe customer/i.test(message)
    ) {
      return reply.status(400).send({ message: message || "Bad request" });
    }

    if (
      name === "InstructorLimitReachedError" ||
      /limit reached/i.test(message)
    ) {
      return reply.status(409).send({ message: message || "Conflict" });
    }

    if (message.includes("OPENAI_API_KEY") || message.includes("STRIPE_")) {
      return reply.status(503).send({
        message: message || "Service unavailable",
      });
    }

    if (name === "AppError" && typeof err.statusCode === "number") {
      return reply.status(err.statusCode).send({ message: message });
    }

    log(error);
    return reply.status(500).send({ message: "Internal server error" });
  };
}
