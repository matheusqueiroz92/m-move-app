"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import {
  useWorkoutPlan,
  useActivateWorkoutPlan,
} from "@/lib/hooks/use-workout-plans";
import { useWorkoutDays } from "@/lib/hooks/use-workout-days";
import { formatDuration } from "@/lib/utils/formatDuration";

export default function WorkoutPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: plan, isLoading, error } = useWorkoutPlan(id);
  const { data: days, isLoading: daysLoading } = useWorkoutDays(id);
  const activatePlan = useActivateWorkoutPlan();

  if (error || (!isLoading && !plan)) {
    return (
      <div className="p-4">
        <p className="text-[var(--color-danger)]">Plano não encontrado.</p>
        <Link
          href="/workout-plans"
          className="mt-2 inline-block text-[var(--color-primary)] hover:underline"
        >
          Voltar
        </Link>
      </div>
    );
  }

  if (isLoading || !plan) {
    return (
      <div className="p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-border)]" />
        <div className="mt-4 h-32 animate-pulse rounded bg-[var(--color-surface)]" />
      </div>
    );
  }

  const dayList = days ?? [];

  async function handleActivate() {
    await activatePlan.mutateAsync(id);
  }

  return (
    <div className="p-4 md:p-6">
      <Link
        href="/workout-plans"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {plan.name}
          </h1>
          {plan.description && (
            <p className="mt-1 text-[var(--color-text-secondary)]">
              {plan.description}
            </p>
          )}
        </div>
        {!plan.isActive && (
          <button
            type="button"
            onClick={handleActivate}
            disabled={activatePlan.isPending}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
          >
            Ativar plano
          </button>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Dias do treino
        </h2>
        {daysLoading ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-[var(--color-surface)]"
              />
            ))}
          </div>
        ) : dayList.length === 0 ? (
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Nenhum dia cadastrado. Adicione dias ao plano.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {dayList.map((day) => (
              <li key={day.id}>
                <Link
                  href={`/workout-plans/${id}/days/${day.id}`}
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
