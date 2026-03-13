import type { FastifyReply, FastifyRequest } from "fastify";

export async function listPhysicalAssessmentsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const assessments = await request.server.useCases.listPhysicalAssessmentsByUser.execute({
    userId,
  });
  const body = assessments.map((a) => ({
    ...a,
    assessedAt: a.assessedAt.toISOString(),
  }));
  return reply.status(200).send(body);
}
