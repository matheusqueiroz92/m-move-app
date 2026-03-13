import type { FastifyReply, FastifyRequest } from "fastify";

export async function listPhysicalAssessmentsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const assessments = await request.server.useCases.listPhysicalAssessmentsByUser.execute({
    userId,
  });
  const body = assessments.map((a) => ({
    ...a,
    assessedAt: a.assessedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
