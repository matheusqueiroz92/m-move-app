import { DashboardGuard } from "@/components/auth/DashboardGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </DashboardGuard>
  );
}
