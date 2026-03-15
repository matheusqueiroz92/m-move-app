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

function withRequestId<T extends object>(
  payload: T,
  requestId: string,
): T & { requestId: string } {
  return { ...payload, requestId };
}

export function createErrorHandler(
  log: (error: unknown, request?: FastifyRequest) => void,
): (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => void {
  return (error, request, reply) => {
    const requestId = request.id;

    if (error instanceof ZodError) {
      return reply.status(400).send(
        withRequestId(
          {
            message: "Validation error",
            issues: error.flatten().fieldErrors,
          },
          requestId,
        ),
      );
    }

    const err = error as ErrorWithMeta;
    const name = err?.name ?? err?.constructor?.name;
    const message = err?.message ?? "";

    if (err.code === "FST_ERR_VALIDATION") {
      return reply
        .status(400)
        .send(
          withRequestId({ message: message || "Validation error" }, requestId),
        );
    }

    if (name && (NOT_FOUND_ERROR_NAMES as readonly string[]).includes(name)) {
      return reply
        .status(404)
        .send(withRequestId({ message: message || "Not found" }, requestId));
    }
    if (/not found/i.test(message)) {
      return reply
        .status(404)
        .send(withRequestId({ message: message || "Not found" }, requestId));
    }

    if (
      name === "InviteExpiredError" ||
      name === "InviteAlreadyUsedError" ||
      name === "SessionNotStartedError" ||
      name === "PlanMustHaveAtLeastOneDayError" ||
      name === "CannotDeleteLastDayError" ||
      name === "CannotDeleteLastExerciseError" ||
      /expired|already used|revoked|not started|at least one day|last day|last exercise/i.test(
        message,
      )
    ) {
      return reply
        .status(400)
        .send(withRequestId({ message: message || "Bad request" }, requestId));
    }
    if (
      message === "Invalid signature" ||
      /no Stripe customer/i.test(message)
    ) {
      return reply
        .status(400)
        .send(withRequestId({ message: message || "Bad request" }, requestId));
    }

    if (
      name === "InstructorLimitReachedError" ||
      name === "StudentLimitReachedError" ||
      name === "PtStudentLimitReachedError" ||
      /limit reached/i.test(message)
    ) {
      return reply
        .status(409)
        .send(withRequestId({ message: message || "Conflict" }, requestId));
    }

    if (message.includes("OPENAI_API_KEY") || message.includes("STRIPE_")) {
      return reply
        .status(503)
        .send(
          withRequestId(
            { message: message || "Service unavailable" },
            requestId,
          ),
        );
    }

    if (name === "AppError" && typeof err.statusCode === "number") {
      return reply
        .status(err.statusCode)
        .send(withRequestId({ message: message }, requestId));
    }

    log(error, request);
    return reply
      .status(500)
      .send(withRequestId({ message: "Internal server error" }, requestId));
  };
}
