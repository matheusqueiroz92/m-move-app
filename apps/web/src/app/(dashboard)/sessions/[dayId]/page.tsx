"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { listExercises } from "@/lib/api/workout-plans";
import { startSession, completeSession } from "@/lib/api/sessions";
import type { WorkoutExerciseResponse } from "@m-move-app/types";

export default function SessionExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const dayId = params.dayId as string;
  const [exercises, setExercises] = useState<WorkoutExerciseResponse[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [exList] = await Promise.all([listExercises(dayId)]);
        if (!cancelled) setExercises(exList);
      } catch {
        if (!cancelled) setExercises([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [dayId]);

  async function handleStart() {
    setStarting(true);
    try {
      const session = await startSession(dayId);
      setSessionId(session.id);
    } catch {
      setStarting(false);
    } finally {
      setStarting(false);
    }
  }

  async function toggleComplete(exerciseId: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }

  async function handleFinish() {
    if (!sessionId) return;
    setCompleting(true);
    try {
      await completeSession(sessionId);
      router.push("/sessions");
    } finally {
      setCompleting(false);
    }
  }

  const allDone =
    exercises.length > 0 && completedIds.size === exercises.length;

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-border" />
        <div className="mt-6 h-64 animate-pulse rounded bg-surface" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="p-4">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <p className="mt-4 text-text-secondary">
          Nenhum exercício neste dia ou dia não encontrado.
        </p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="p-4 md:p-6">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="mt-8 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-text-primary">
            {exercises.length} exercício(s) neste treino.
          </p>
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="mt-4 rounded-md bg-primary px-6 py-2 font-medium text-background hover:bg-primary-dark disabled:opacity-50"
          >
            {starting ? "Iniciando..." : "Iniciar treino"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">
        Executando treino
      </h1>
      <p className="mt-1 text-text-secondary">
        Marque os exercícios ao concluir.
      </p>

      <ul className="mt-6 space-y-3">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <button
              type="button"
              onClick={() => toggleComplete(ex.id)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                completedIds.has(ex.id)
                  ? "border-success bg-success text-white"
                  : "border-border hover:border-primary"
              }`}
              aria-pressed={completedIds.has(ex.id)}
            >
              {completedIds.has(ex.id) ? <Check className="h-4 w-4" /> : null}
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text-primary">{ex.name}</p>
              <p className="text-sm text-text-secondary">
                {ex.sets} séries × {ex.reps} reps
                {ex.restTimeInSeconds > 0 &&
                  ` · Descanso ${ex.restTimeInSeconds}s`}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleFinish}
          disabled={!allDone || completing}
          className="rounded-md bg-primary px-6 py-2 font-medium text-background hover:bg-primary-dark disabled:opacity-50"
        >
          {completing ? "Salvando..." : "Concluir treino"}
        </button>
      </div>
    </div>
  );
}
