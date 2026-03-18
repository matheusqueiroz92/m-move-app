import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardGuard } from "./DashboardGuard";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    isInitialized: true,
  }),
}));

describe("DashboardGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when authenticated", () => {
    render(
      <DashboardGuard>
        <span>Dashboard content</span>
      </DashboardGuard>,
    );
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });
});
