"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: subscription } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: getSubscriptionStatus,
  });

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Configurações
      </h1>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Perfil
        </h2>
        <dl className="mt-4 space-y-2">
          <div>
            <dt className="text-sm text-[var(--color-text-secondary)]">Nome</dt>
            <dd className="text-[var(--color-text-primary)]">
              {user?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--color-text-secondary)]">
              Email
            </dt>
            <dd className="text-[var(--color-text-primary)]">
              {user?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--color-text-secondary)]">
              Função
            </dt>
            <dd className="text-[var(--color-text-primary)]">
              {user?.role ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Assinatura
        </h2>
        {subscription ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Plano:{" "}
              <span className="text-[var(--color-text-primary)]">
                {subscription.planType}
              </span>
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Status:{" "}
              <span className="text-[var(--color-text-primary)]">
                {subscription.status}
              </span>
            </p>
            <Link
              href="/billing"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Gerenciar assinatura →
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            <Link
              href="/billing"
              className="text-[var(--color-primary)] hover:underline"
            >
              Ver assinatura e pagamento
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
