"use client";

import Link from "next/link";
import { Calendar, Play } from "lucide-react";
import { useWorkoutPlans } from "@/lib/hooks/use-workout-plans";
import { useWorkoutDays } from "@/lib/hooks/use-workout-days";
import { formatDuration } from "@/lib/utils/formatDuration";

export default function SessionsPage() {
  const { data: plansData } = useWorkoutPlans({ limit: 20, offset: 0 });
  const activePlan = plansData?.items?.find((p) => p.isActive);
  const planId = activePlan?.id ?? null;
  const { data: days, isLoading } = useWorkoutDays(planId);

  const dayList = days ?? [];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Sessões
      </h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Escolha o dia do treino para executar.
      </p>

      {!activePlan ? (
        <p className="mt-6 text-[var(--color-text-secondary)]">
          Nenhum plano ativo. Ative um plano em{" "}
          <Link
            href="/workout-plans"
            className="text-[var(--color-primary)] hover:underline"
          >
            Meus Treinos
          </Link>
          .
        </p>
      ) : isLoading ? (
        <div className="mt-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : dayList.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-secondary)]">
          Nenhum dia no plano &quot;{activePlan.name}&quot;. Adicione dias em{" "}
          <Link
            href={`/workout-plans/${activePlan.id}`}
            className="text-[var(--color-primary)] hover:underline"
          >
            detalhes do plano
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {dayList.map((day) => (
            <li key={day.id}>
              <Link
                href={`/sessions/${day.id}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]/50"
              >
                <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {day.name}
                    {day.isRest && (
                      <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
                        (descanso)
                      </span>
                    )}
                  </p>
                  {day.estimatedDurationInSeconds != null && (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {formatDuration(day.estimatedDurationInSeconds)}
                    </p>
                  )}
                </div>
                {!day.isRest && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary)]/20 px-3 py-1 text-sm font-medium text-[var(--color-primary)]">
                    <Play className="h-4 w-4" />
                    Executar
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
