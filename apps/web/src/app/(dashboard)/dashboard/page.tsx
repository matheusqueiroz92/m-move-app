"use client";

import Link from "next/link";
import { Flame, Dumbbell } from "lucide-react";
import { useStreak } from "@/lib/hooks/use-streak";
import { useWorkoutPlans } from "@/lib/hooks/use-workout-plans";

export default function DashboardPage() {
  const { data: streakData, isLoading: streakLoading } = useStreak();
  const { data: plansData, isLoading: plansLoading } = useWorkoutPlans({
    limit: 5,
    offset: 0,
  });

  const streak = streakData?.streak ?? 0;
  const activePlan = plansData?.items?.find((p) => p.isActive);
  const plans = plansData?.items ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Flame className="h-5 w-5 text-[var(--color-warning)]" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          {streakLoading ? (
            <div className="mt-2 h-8 w-12 animate-pulse rounded bg-[var(--color-border)]" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
              {streak} {streak === 1 ? "dia" : "dias"}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Dumbbell className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-sm font-medium">Plano ativo</span>
          </div>
          {plansLoading ? (
            <div className="mt-2 h-8 w-32 animate-pulse rounded bg-[var(--color-border)]" />
          ) : activePlan ? (
            <Link
              href={`/workout-plans/${activePlan.id}`}
              className="mt-2 block truncate text-lg font-semibold text-[var(--color-primary)] hover:underline"
            >
              {activePlan.name}
            </Link>
          ) : (
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Nenhum plano ativo
            </p>
          )}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Meus Treinos
          </h2>
          <Link
            href="/workout-plans"
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Ver todos
          </Link>
        </div>
        {plansLoading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-[var(--color-surface)]"
              />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Nenhum plano ainda.{" "}
            <Link
              href="/workout-plans"
              className="text-[var(--color-primary)] hover:underline"
            >
              Criar plano
            </Link>
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.slice(0, 3).map((plan) => (
              <Link
                key={plan.id}
                href={`/workout-plans/${plan.id}`}
                className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-primary)]/50"
              >
                <p className="font-semibold text-[var(--color-text-primary)]">
                  {plan.name}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {plan.isActive ? "Ativo" : "Inativo"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
