"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname
          .split("/")
          .filter(Boolean)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" / ");

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0">
      <h1 className="text-lg font-semibold text-text-primary truncate">
        {title}
      </h1>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-primary hover:bg-border focus:outline-none focus:ring-2 focus:ring-primary"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <User className="h-5 w-5" />
          <span className="max-w-[120px] truncate">
            {user?.name ?? "Conta"}
          </span>
        </button>
        {open && (
          <div
            className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-surface py-1 shadow-lg z-50"
            role="menu"
          >
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-border"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              Perfil
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-border"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
