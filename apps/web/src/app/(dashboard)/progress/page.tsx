"use client";

import { Flame } from "lucide-react";
import { useStreak } from "@/lib/hooks/use-streak";
import { useSessionHistory } from "@/lib/hooks/use-session-history";
import dayjs from "dayjs";

export default function ProgressPage() {
  const { data: streakData, isLoading: streakLoading } = useStreak();
  const { data: history, isLoading: historyLoading } = useSessionHistory({
    limit: 30,
    offset: 0,
  });

  const streak = streakData?.streak ?? 0;
  const sessions = history ?? [];

  return (
    <div className="p-4 md:p-6 space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Progresso</h1>

      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2 text-text-secondary">
          <Flame className="h-6 w-6 text-warning" />
          <span className="text-sm font-medium">Streak atual</span>
        </div>
        {streakLoading ? (
          <div className="mt-2 h-10 w-16 animate-pulse rounded bg-border" />
        ) : (
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {streak} {streak === 1 ? "dia" : "dias"}
          </p>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-text-primary">
          Histórico de sessões
        </h2>
        {historyLoading ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-surface"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="mt-4 text-text-secondary">
            Nenhuma sessão registrada ainda.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="text-text-primary">
                  {dayjs(s.startedAt).format("DD/MM/YYYY HH:mm")}
                </span>
                <span className="text-sm text-text-secondary">
                  {s.completedAt ? "Concluída" : "Em andamento"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
