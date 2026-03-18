/**
 * Auth-related API calls (Better Auth endpoints via proxy).
 * Uses fetch with credentials for cookie-based auth.
 */
export async function forgetPassword(
  email: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await fetch("/api/auth/forget-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      message:
        (data as { message?: string }).message ??
        "Falha ao enviar. Tente novamente.",
    };
  }
  return { ok: true };
}
