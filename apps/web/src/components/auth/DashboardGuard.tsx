"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname ?? "/dashboard")}`,
      );
    }
  }, [isInitialized, isLoading, isAuthenticated, router, pathname]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-secondary)]">
          Carregando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
