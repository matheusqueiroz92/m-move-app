import type { EmailSender } from "../../domain/email/email-sender.interface.js";
import {
  buildNoReplyFromAddress,
  replaceResetUrlOriginForWebApp,
} from "./build-no-reply-from-web-app-url.js";
import { sendPasswordResetEmail } from "./password-reset-email.js";

export type BetterAuthPasswordResetInput = {
  user: { email: string };
  url: string;
};

export type ExecuteBetterAuthPasswordResetEmailConfig = {
  resendApiKey: string | undefined;
  apiBaseUrl: string;
  webAppBaseUrl: string | undefined;
  resendFromOverride: string | undefined;
  createEmailSender: (apiKey: string) => EmailSender;
};

/**
 * Envia o e-mail de reset via Resend, alinhado ao callback `sendResetPassword` do Better Auth.
 */
export async function executeBetterAuthPasswordResetEmail(
  input: BetterAuthPasswordResetInput,
  config: ExecuteBetterAuthPasswordResetEmailConfig,
): Promise<void> {
  const apiKey = config.resendApiKey;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY não configurada. Defina a variável de ambiente para enviar o e-mail de reset de senha.",
    );
  }

  const webBase = config.webAppBaseUrl ?? config.apiBaseUrl;
  const resetUrl = config.webAppBaseUrl
    ? replaceResetUrlOriginForWebApp(
        input.url,
        config.apiBaseUrl,
        config.webAppBaseUrl,
      )
    : input.url;

  const from = buildNoReplyFromAddress(webBase, config.resendFromOverride);
  const provider = config.createEmailSender(apiKey);

  await sendPasswordResetEmail({
    emailSender: provider,
    from,
    to: input.user.email,
    resetUrl,
  });
}
