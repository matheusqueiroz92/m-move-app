import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WorkoutPlansPage from "./page";

const mockListWorkoutPlans = vi.fn();
const mockCreateWorkoutPlan = vi.fn();
const mockActivateWorkoutPlan = vi.fn();

vi.mock("@/lib/api/workout-plans", () => ({
  listWorkoutPlans: (...args: unknown[]) => mockListWorkoutPlans(...args),
  getWorkoutPlan: vi.fn(),
  createWorkoutPlan: (...args: unknown[]) => mockCreateWorkoutPlan(...args),
  updateWorkoutPlan: vi.fn(),
  deleteWorkoutPlan: vi.fn(),
  activateWorkoutPlan: (...args: unknown[]) => mockActivateWorkoutPlan(...args),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("WorkoutPlansPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeletons while fetching", () => {
    mockListWorkoutPlans.mockImplementation(() => new Promise(() => {}));
    render(<WorkoutPlansPage />, { wrapper });
    const skeletons = document.querySelectorAll("[class*='animate-pulse']");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.getByText(/meus treinos/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /novo plano/i }),
    ).toBeInTheDocument();
  });

  it("shows empty message when no plans", async () => {
    mockListWorkoutPlans.mockResolvedValue({ items: [], total: 0 });
    render(<WorkoutPlansPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/nenhum plano ainda/i)).toBeInTheDocument();
    });
  });

  it("shows list of plans when data is loaded", async () => {
    const plans = [
      { id: "1", name: "Plano A", isActive: true },
      { id: "2", name: "Plano B", isActive: false },
    ];
    mockListWorkoutPlans.mockResolvedValue({ items: plans, total: 2 });
    render(<WorkoutPlansPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Plano A")).toBeInTheDocument();
      expect(screen.getByText("Plano B")).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    mockListWorkoutPlans.mockRejectedValue(new Error("Network error"));
    render(<WorkoutPlansPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar planos/i)).toBeInTheDocument();
    });
  });
});
