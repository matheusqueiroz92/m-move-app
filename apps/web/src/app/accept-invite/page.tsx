"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de convite não informado.");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    async function accept() {
      try {
        const ptRes = await apiClient
          .post("/api/pt/invites/accept", { token })
          .catch(() => null);
        if (cancelled) return;
        if (ptRes?.status === 200) {
          setStatus("success");
          setMessage("Convite aceito! Redirecionando...");
          setTimeout(() => router.push("/dashboard"), 2000);
          return;
        }

        const gymRes = await apiClient
          .post("/api/gym/accept-invite", { token })
          .catch(() => null);
        if (cancelled) return;
        if (gymRes?.status === 200) {
          setStatus("success");
          setMessage("Convite da academia aceito! Redirecionando...");
          setTimeout(() => router.push("/dashboard"), 2000);
          return;
        }

        setStatus("error");
        setMessage("Convite inválido ou expirado.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Erro ao aceitar convite. Tente novamente.");
        }
      }
    }

    accept();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-bold text-primary">
          M. Move — Aceitar convite
        </h1>
        {status === "loading" && (
          <p className="mt-4 text-text-secondary">Processando convite...</p>
        )}
        {status === "success" && <p className="mt-4 text-success">{message}</p>}
        {status === "error" && (
          <>
            <p className="mt-4 text-danger">{message}</p>
            <Link
              href="/login"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Ir para login
            </Link>
          </>
        )}
        {status === "idle" && token && (
          <p className="mt-4 text-text-secondary">Aguarde...</p>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-t-transparent border-b-transparent border-r-transparent border-l-transparent border-2 border-primary rounded-full animate-spin"></div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
