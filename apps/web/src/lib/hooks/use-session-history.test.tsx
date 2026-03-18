import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSessionHistory } from "./use-session-history";

const getSessionHistory = vi.fn();

vi.mock("@/lib/api/sessions", () => ({
  getSessionHistory: (...args: unknown[]) => getSessionHistory(...args),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useSessionHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches session history successfully", async () => {
    const items = [
      { id: "1", workoutDayId: "d1", startedAt: "", completedAt: "" },
    ];
    getSessionHistory.mockResolvedValue(items);

    const { result } = renderHook(() => useSessionHistory({ limit: 10 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(items);
    expect(getSessionHistory).toHaveBeenCalledWith({ limit: 10 });
  });
});
