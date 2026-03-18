"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Spinner } from "@/components/ui/Spinner";
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
    return <Spinner fullScreen size="lg" label="Carregando..." />;
  }

  if (!user || !roles.includes(user.role as UserRole)) {
    return null;
  }

  return <>{children}</>;
}
