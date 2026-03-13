import type { FastifyReply, FastifyRequest } from "fastify";

export async function getPhysicalAssessmentByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const assessment = await request.server.useCases.getPhysicalAssessmentById.execute({
    id: request.params.id,
  });
  if (assessment.userId !== userId && assessment.assessedBy !== userId) {
    return reply.status(403).send({ message: "Forbidden" });
  }
  return reply.status(200).send({
    ...assessment,
    assessedAt: assessment.assessedAt.toISOString(),
  });
}
