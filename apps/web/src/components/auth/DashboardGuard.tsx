"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Spinner } from "@/components/ui/Spinner";

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
    return <Spinner fullScreen size="lg" label="Carregando..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
