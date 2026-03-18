"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  TrendingUp,
  ClipboardList,
  Users,
  Building2,
  GraduationCap,
  MessageSquare,
  Settings,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/use-auth";
import type { UserRole } from "@m-move-app/constants";

const navItems: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  hideForRoles?: UserRole[];
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workout-plans", label: "Meus Treinos", icon: Dumbbell },
  { href: "/sessions", label: "Sessões", icon: Calendar },
  { href: "/progress", label: "Progresso", icon: TrendingUp },
  { href: "/assessments", label: "Avaliações", icon: ClipboardList },
  {
    href: "/students",
    label: "Meus Alunos",
    icon: Users,
    roles: ["OWNER", "PERSONAL_TRAINER", "INSTRUCTOR"],
  },
  {
    href: "/gym",
    label: "Academia",
    icon: Building2,
    roles: ["OWNER"],
  },
  {
    href: "/instructors",
    label: "Instrutores",
    icon: GraduationCap,
    roles: ["OWNER", "INSTRUCTOR"],
  },
  {
    href: "/linked-students",
    label: "Alunos Vinculados",
    icon: Users,
    roles: ["OWNER", "PERSONAL_TRAINER", "INSTRUCTOR"],
  },
  {
    href: "/ai-chat",
    label: "Chat IA",
    icon: MessageSquare,
    hideForRoles: ["LINKED_STUDENT"],
  },
  { href: "/settings", label: "Configurações", icon: Settings },
  { href: "/billing", label: "Pagamento", icon: CreditCard },
];

function canSeeItem(item: (typeof navItems)[0], userRole: string): boolean {
  if (item.hideForRoles?.includes(userRole as UserRole)) return false;
  if (item.roles && !item.roles.includes(userRole as UserRole)) return false;
  return true;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "STUDENT";

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          M. Move
        </Link>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto" aria-label="Menu principal">
        <ul className="space-y-0.5">
          {navItems
            .filter((item) => canSeeItem(item, role))
            .map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-text-secondary hover:bg-border hover:text-text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
}
