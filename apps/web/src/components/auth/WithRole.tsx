"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import type { UserRole } from "@m-move-app/constants";

interface WithRoleProps {
  children: React.ReactNode;
  roles: UserRole[];
}

export function WithRole({ children, roles }: WithRoleProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || isLoading || !user) return;
    const hasRole = roles.includes(user.role as UserRole);
    if (!hasRole) {
      router.replace("/dashboard");
    }
  }, [isInitialized, isLoading, user, roles, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-secondary)]">
          Carregando...
        </div>
      </div>
    );
  }

  if (!user || !roles.includes(user.role as UserRole)) {
    return null;
  }

  return <>{children}</>;
}
