"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { PageSuspense } from "@/components/layout/PageSuspense";
import { Spinner } from "@/components/ui/Spinner";
import { useAcceptInvite } from "@/lib/hooks/use-accept-invite";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const {
    mutate: acceptInvite,
    isPending,
    isSuccess,
    isError,
    data,
    error,
  } = useAcceptInvite();

  useEffect(() => {
    if (!token) return;
    acceptInvite(token);
  }, [token, acceptInvite]);

  useEffect(() => {
    if (!isSuccess || !data?.ok) return;
    const t = setTimeout(() => router.push("/dashboard"), 2000);
    return () => clearTimeout(t);
  }, [isSuccess, data, router]);

  const hasError = !token ? true : isError || (isSuccess && data && !data.ok);
  const errorMessage = !token
    ? "Token de convite não informado."
    : data && !data.ok
      ? data.error
      : error instanceof Error
        ? error.message
        : "Erro ao aceitar convite. Tente novamente.";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-bold text-primary">
          M. Move — Aceitar convite
        </h1>
        {isPending && (
          <div className="mt-4 flex justify-center">
            <Spinner size="lg" label="Processando convite..." />
          </div>
        )}
        {isSuccess && data?.ok && (
          <p className="mt-4 text-success">
            {data.source === "pt"
              ? "Convite aceito! Redirecionando..."
              : "Convite da academia aceito! Redirecionando..."}
          </p>
        )}
        {hasError && !isPending && (
          <>
            <p className="mt-4 text-danger">{errorMessage}</p>
            {token && (
              <Link
                href="/login"
                className="mt-4 inline-block text-primary hover:underline"
              >
                Ir para login
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <PageSuspense fallbackLabel="Carregando...">
      <AcceptInviteContent />
    </PageSuspense>
  );
}
