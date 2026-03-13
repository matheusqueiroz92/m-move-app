import type { FastifyReply, FastifyRequest } from "fastify";

export async function getHistoryPhysicalAssessmentsHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const requestUserId = request.userId;
  if (!requestUserId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const { userId } = request.params;
  if (userId !== requestUserId) {
    return reply.status(403).send({ message: "Forbidden" });
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
