import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Middleware that blocks LINKED_STUDENT from creating/editing/deleting workout plans.
 * RF-019: LINKED_STUDENT cannot create or edit plans — only PT, INSTRUCTOR or OWNER who invited them can.
 */
export async function requireNotLinkedStudent(
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

  if (user.role === "LINKED_STUDENT") {
    return reply.status(403).send({
      message: "Forbidden",
      detail:
        "LINKED_STUDENT cannot create or edit workout plans. Only the linked PT, INSTRUCTOR or OWNER can manage plans for you.",
    });
  }
}
