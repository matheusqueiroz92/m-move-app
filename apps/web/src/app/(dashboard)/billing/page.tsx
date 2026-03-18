"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  getSubscriptionStatus,
  createPortalSession,
} from "@/lib/api/subscriptions";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: getSubscriptionStatus,
  });

  async function handleManageSubscription() {
    if (!subscription) return;
    setLoading(true);
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const { url } = await createPortalSession(`${base}/settings`);
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <Link
        href="/settings"
        className="text-sm text-text-secondary hover:text-primary"
      >
        ← Configurações
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">
        Assinatura e pagamento
      </h1>

      {isLoading ? (
        <div className="mt-6 h-24 animate-pulse rounded-lg bg-surface" />
      ) : subscription ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6 space-y-4">
          <p className="text-text-primary">
            <span className="text-text-secondary">Plano:</span>{" "}
            {subscription.planType}
          </p>
          <p className="text-text-primary">
            <span className="text-text-secondary">Status:</span>{" "}
            {subscription.status}
          </p>
          <button
            type="button"
            onClick={handleManageSubscription}
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Redirecionando..." : "Gerenciar no Stripe"}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-text-secondary">
          Nenhuma assinatura ativa. Faça upgrade na landing ou após o cadastro.
        </p>
      )}
    </div>
  );
}
