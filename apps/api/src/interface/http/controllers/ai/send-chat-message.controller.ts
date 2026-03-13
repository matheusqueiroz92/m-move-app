import type { FastifyReply, FastifyRequest } from "fastify";

export async function sendChatMessageHandler(
  request: FastifyRequest<{
    Body: { chatId?: string | null; content: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const result = await request.server.useCases.sendChatMessage.execute({
    userId,
    chatId: request.body.chatId ?? null,
    content: request.body.content,
  });

  return reply.status(200).send(result);
}
