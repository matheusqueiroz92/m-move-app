import type { FastifyReply, FastifyRequest } from "fastify";

type UserRole =
  | "OWNER"
  | "PERSONAL_TRAINER"
  | "INSTRUCTOR"
  | "STUDENT"
  | "LINKED_STUDENT";

export function requireRole(allowedRoles: UserRole[]) {
  return async function authorize(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const userRepository = request.server.userRepository;
    const user = await userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return reply.status(403).send({
        message: "Forbidden",
        detail: `Required role: ${allowedRoles.join(" or ")}`,
      });
    }
  };
}
