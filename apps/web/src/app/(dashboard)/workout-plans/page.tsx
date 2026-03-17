"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useWorkoutPlans,
  useCreateWorkoutPlan,
  useActivateWorkoutPlan,
} from "@/lib/hooks/use-workout-plans";
import { WorkoutPlanCard } from "@/components/workout/WorkoutPlanCard";
export default function WorkoutPlansPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { data, isLoading, error } = useWorkoutPlans({ limit: 50, offset: 0 });
  const createPlan = useCreateWorkoutPlan();
  const activatePlan = useActivateWorkoutPlan();
  const plans = data?.items ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const result = await createPlan.mutateAsync({ name: newName.trim() });
    setNewName("");
    setCreateOpen(false);
    if (result?.id) await activatePlan.mutateAsync(result.id);
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Meus Treinos
        </h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)]"
        >
          <Plus className="h-4 w-4" />
          Novo plano
        </button>
      </div>

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-plan-title"
        >
          <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2
              id="create-plan-title"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              Novo plano de treino
            </h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="plan-name"
                  className="block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Nome
                </label>
                <input
                  id="plan-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createPlan.isPending}
                  className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                >
                  {createPlan.isPending ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-[var(--color-danger)]">
          Erro ao carregar planos. Tente novamente.
        </p>
      )}
      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-secondary)]">
          Nenhum plano ainda. Clique em &quot;Novo plano&quot; para criar.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <WorkoutPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
