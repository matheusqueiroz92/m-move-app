"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUpWithEmail, signInWithSocial } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await signUpWithEmail(email, password, name);
    setIsSubmitting(false);
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Falha ao cadastrar.");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] text-center">
          M. Move
        </h1>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] text-center">
          Cadastro
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
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
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[var(--color-primary)] py-2 px-4 font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => signInWithSocial("google")}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-2 px-4 text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
          >
            Continuar com Google
          </button>
        </div>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-[var(--color-primary)] hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
