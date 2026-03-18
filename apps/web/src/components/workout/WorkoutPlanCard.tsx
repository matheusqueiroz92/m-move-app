"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { WorkoutPlanResponse } from "@m-move-app/types";

interface WorkoutPlanCardProps {
  plan: WorkoutPlanResponse;
  progressPercent?: number;
  className?: string;
}

export function WorkoutPlanCard({
  plan,
  progressPercent = 0,
  className,
}: WorkoutPlanCardProps) {
  return (
    <Link
      href={`/workout-plans/${plan.id}`}
      className={cn(
        "block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50 hover:bg-surface/90",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/20">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-text-primary">
              {plan.name}
            </h3>
            <p className="text-xs text-text-secondary">
              {plan.isActive ? (
                <span className="text-success">Ativo</span>
              ) : (
                "Inativo"
              )}
            </p>
          </div>
        </div>
      </div>
      {progressPercent > 0 && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
