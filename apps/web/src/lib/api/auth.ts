/**
 * Auth-related API calls (Better Auth endpoints via proxy).
 * Uses fetch with credentials for cookie-based auth.
 */
export async function forgetPassword(
  email: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  // Better Auth expõe o endpoint como "request-password-reset"
  const res = await fetch("/api/auth/request-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    // Em 404/500 o Better Auth pode devolver body `null`, então precisamos tratar isso.
    const data: unknown = await res.json().catch(() => null);

    const message: string | undefined =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : undefined;

    return {
      ok: false,
      message: message ?? "Falha ao enviar. Tente novamente.",
    };
  }
  return { ok: true };
}
