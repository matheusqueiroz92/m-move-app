"use client";

import { cn } from "@/lib/utils/cn";

type SpinnerSize = "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Spinner({
  size = "md",
  label,
  fullScreen = false,
  className,
}: SpinnerProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "min-h-screen w-full bg-background",
        className,
      )}
      role="status"
      aria-label={label ?? "Carregando"}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size],
        )}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );

  return content;
}
