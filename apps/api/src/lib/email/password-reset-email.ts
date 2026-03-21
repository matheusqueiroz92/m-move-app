import type { EmailSender } from "../../domain/email/email-sender.interface.js";

export type SendPasswordResetEmailParams = {
  emailSender: EmailSender;
  from: string;
  to: string;
  resetUrl: string;
};

const SUBJECT = "Redefinição de senha — M. Move";

export async function sendPasswordResetEmail(
  params: SendPasswordResetEmailParams,
): Promise<{ id: string }> {
  const { emailSender, from, to, resetUrl } = params;
  const text = [
    "Recebemos um pedido para redefinir sua senha na M. Move.",
    "",
    `Acesse o link para criar uma nova senha: ${resetUrl}`,
    "",
    "Se você não solicitou, ignore este e-mail.",
  ].join("\n");

  const html = `
    <p>Recebemos um pedido para redefinir sua senha na <strong>M. Move</strong>.</p>
    <p><a href="${escapeHtml(resetUrl)}">Redefinir senha</a></p>
    <p>Se você não solicitou, ignore este e-mail.</p>
  `.trim();

  return emailSender.sendTransactionalEmail({
    from,
    to,
    subject: SUBJECT,
    html,
    text,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
