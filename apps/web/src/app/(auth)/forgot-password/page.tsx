"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Falha ao enviar. Tente novamente.");
        return;
      }
      setSent(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] text-center">
          M. Move
        </h1>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] text-center">
          Recuperar senha
        </h2>
        {sent ? (
          <p className="text-center text-[var(--color-text-secondary)]">
            Se existir uma conta com esse email, você receberá um link para
            redefinir a senha.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-[var(--color-danger)]" role="alert">
                {error}
              </p>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[var(--color-primary)] py-2 px-4 font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          <Link
            href="/login"
            className="text-[var(--color-primary)] hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
