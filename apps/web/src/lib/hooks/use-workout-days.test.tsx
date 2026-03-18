import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useWorkoutDays,
  useCreateWorkoutDay,
  useDeleteWorkoutDay,
} from "./use-workout-days";

const listWorkoutDays = vi.fn();
const createWorkoutDay = vi.fn();
const deleteWorkoutDay = vi.fn();

vi.mock("@/lib/api/workout-plans", () => ({
  listWorkoutDays: (...args: unknown[]) => listWorkoutDays(...args),
  createWorkoutDay: (...args: unknown[]) => createWorkoutDay(...args),
  updateWorkoutDay: vi.fn(),
  deleteWorkoutDay: (...args: unknown[]) => deleteWorkoutDay(...args),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useWorkoutDays", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches days when planId is provided", async () => {
    const days = [{ id: "d1", name: "Segunda", isRest: false }];
    listWorkoutDays.mockResolvedValue(days);

    const { result } = renderHook(() => useWorkoutDays("plan-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(days);
    expect(listWorkoutDays).toHaveBeenCalledWith("plan-1");
  });

  it("does not fetch when planId is null", () => {
    const { result } = renderHook(() => useWorkoutDays(null), { wrapper });
    expect(result.current.isFetching).toBe(false);
    expect(listWorkoutDays).not.toHaveBeenCalled();
  });
});

describe("useCreateWorkoutDay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates day", async () => {
    createWorkoutDay.mockResolvedValue({
      id: "d2",
      name: "Terça",
      isRest: false,
    });

    const { result } = renderHook(() => useCreateWorkoutDay("plan-1"), {
      wrapper,
    });

    result.current.mutate({
      name: "Terça",
      weekDay: "TUESDAY",
      isRest: false,
      estimatedDurationInSeconds: 3600,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createWorkoutDay).toHaveBeenCalled();
    expect(createWorkoutDay.mock.calls[0]?.[0]).toBe("plan-1");
  });
});

describe("useDeleteWorkoutDay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes day", async () => {
    deleteWorkoutDay.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteWorkoutDay("plan-1"), {
      wrapper,
    });

    result.current.mutate("day-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteWorkoutDay.mock.calls[0]?.[0]).toBe("plan-1");
    expect(deleteWorkoutDay.mock.calls[0]?.[1]).toBe("day-1");
  });
});
