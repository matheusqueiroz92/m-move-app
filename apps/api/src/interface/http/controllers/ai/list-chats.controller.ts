import type { FastifyReply, FastifyRequest } from "fastify";

export async function listChatsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId!;

  const chats = await request.server.useCases.listUserChats.execute({
    userId,
  });
  return reply.status(200).send(
    chats.map((c) => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  );
}
