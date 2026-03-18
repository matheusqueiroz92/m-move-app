import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useWorkoutPlans,
  useWorkoutPlan,
  useCreateWorkoutPlan,
  useActivateWorkoutPlan,
} from "./use-workout-plans";

const listWorkoutPlans = vi.fn();
const getWorkoutPlan = vi.fn();
const createWorkoutPlan = vi.fn();
const activateWorkoutPlan = vi.fn();

vi.mock("@/lib/api/workout-plans", () => ({
  listWorkoutPlans: (...args: unknown[]) => listWorkoutPlans(...args),
  getWorkoutPlan: (...args: unknown[]) => getWorkoutPlan(...args),
  createWorkoutPlan: (...args: unknown[]) => createWorkoutPlan(...args),
  updateWorkoutPlan: vi.fn(),
  deleteWorkoutPlan: vi.fn(),
  activateWorkoutPlan: (...args: unknown[]) => activateWorkoutPlan(...args),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useWorkoutPlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches list successfully", async () => {
    const items = [{ id: "1", name: "Plano A", isActive: true }];
    listWorkoutPlans.mockResolvedValue({ items, total: 1 });

    const { result } = renderHook(
      () => useWorkoutPlans({ limit: 50, offset: 0 }),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toEqual(items);
    expect(listWorkoutPlans).toHaveBeenCalledWith({ limit: 50, offset: 0 });
  });

  it("handles fetch error", async () => {
    listWorkoutPlans.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useWorkoutPlans(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe("useWorkoutPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches single plan when id is provided", async () => {
    const plan = { id: "1", name: "Plano A", isActive: true };
    getWorkoutPlan.mockResolvedValue(plan);

    const { result } = renderHook(() => useWorkoutPlan("1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(plan);
    expect(getWorkoutPlan).toHaveBeenCalledWith("1");
  });

  it("does not fetch when id is null", () => {
    const { result } = renderHook(() => useWorkoutPlan(null), { wrapper });
    expect(result.current.isFetching).toBe(false);
    expect(getWorkoutPlan).not.toHaveBeenCalled();
  });
});

describe("useCreateWorkoutPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates plan and invalidates list", async () => {
    const newPlan = { id: "new-1", name: "Novo", isActive: false };
    createWorkoutPlan.mockResolvedValue(newPlan);

    const { result } = renderHook(() => useCreateWorkoutPlan(), { wrapper });

    result.current.mutate({ name: "Novo" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newPlan);
    expect(createWorkoutPlan).toHaveBeenCalledWith({ name: "Novo" });
  });
});

describe("useActivateWorkoutPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("activates plan", async () => {
    activateWorkoutPlan.mockResolvedValue(undefined);

    const { result } = renderHook(() => useActivateWorkoutPlan(), { wrapper });

    result.current.mutate("plan-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(activateWorkoutPlan).toHaveBeenCalled();
    expect(activateWorkoutPlan.mock.calls[0]?.[0]).toBe("plan-1");
  });
});
