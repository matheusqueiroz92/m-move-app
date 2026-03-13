import type { FastifyReply, FastifyRequest } from "fastify";

export async function getProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const profile = await request.server.useCases.getUserProfile.execute({
    userId,
  });
  return reply.status(200).send(profile);
}
