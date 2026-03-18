"use client";

import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface PageSuspenseProps {
  children: React.ReactNode;
  fallbackLabel?: string;
}

export function PageSuspense({ children, fallbackLabel }: PageSuspenseProps) {
  return (
    <Suspense
      fallback={
        <Spinner
          fullScreen
          size="lg"
          label={fallbackLabel ?? "Carregando..."}
        />
      }
    >
      {children}
    </Suspense>
  );
}
