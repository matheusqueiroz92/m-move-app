/**
 * Monta o remetente `no-reply@<hostname>` a partir da URL base do app web.
 * Opcionalmente aceita override (ex.: domínio verificado no Resend em dev).
 */
export function buildNoReplyFromAddress(
  webAppBaseUrl: string,
  overrideFrom?: string,
): string {
  const trimmed = overrideFrom?.trim();
  if (trimmed) return trimmed;
  const { hostname } = new URL(webAppBaseUrl);
  return `no-reply@${hostname}`;
}

/**
 * Substitui a origem da API pela origem do app web no link de reset
 * (links gerados pelo Better Auth usam `baseURL` da API).
 */
export function replaceResetUrlOriginForWebApp(
  resetUrl: string,
  apiBaseUrl: string,
  webAppBaseUrl: string,
): string {
  try {
    return resetUrl.replace(
      new URL(apiBaseUrl).origin,
      new URL(webAppBaseUrl).origin,
    );
  } catch {
    return resetUrl;
  }
}
