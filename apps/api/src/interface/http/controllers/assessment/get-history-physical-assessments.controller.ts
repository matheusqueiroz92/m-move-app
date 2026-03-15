import type { FastifyReply, FastifyRequest } from "fastify";

export async function getHistoryPhysicalAssessmentsHandler(
  request: FastifyRequest<{
    Params: { userId: string };
    Querystring: { limit?: number; offset?: number };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const requestUserId = request.userId!;
  const limit = request.query.limit ?? 20;
  const offset = request.query.offset ?? 0;

  const { userId } = request.params;

  if (userId !== requestUserId) {
    const requester = await request.server.userRepository.findById(
      requestUserId,
    );
    if (!requester) {
      return reply.status(404).send({ message: "User not found" });
    }

    let hasAccess = false;
    if (requester.role === "OWNER") {
      const gym = await request.server.gymRepository.findByOwnerId(
        requestUserId,
      );
      if (gym) {
        hasAccess = await request.server.gymStudentLinkRepository.hasActiveStudentInGym(
          gym.id,
          userId,
        );
      }
    } else if (requester.role === "INSTRUCTOR") {
      const gymId =
        await request.server.gymInstructorRepository.findActiveGymIdByInstructorId(
          requestUserId,
        );
      if (gymId) {
        hasAccess = await request.server.gymStudentLinkRepository.hasActiveStudentInGym(
          gymId,
          userId,
        );
      }
    }

    if (!hasAccess) {
      return reply.status(403).send({ message: "Forbidden" });
    }
  }

  const result =
    await request.server.useCases.listPhysicalAssessmentsByUser.execute({
      userId,
      limit,
      offset,
    });
  const body = {
    items: result.items.map((a) => ({
      ...a,
      assessedAt: a.assessedAt.toISOString(),
    })),
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  };
  return reply.status(200).send(body);
}
