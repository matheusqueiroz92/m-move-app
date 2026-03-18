import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStreak } from "./use-streak";

const getStreak = vi.fn();

vi.mock("@/lib/api/sessions", () => ({
  getStreak: (...args: unknown[]) => getStreak(...args),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useStreak", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches streak successfully", async () => {
    getStreak.mockResolvedValue({ streak: 5 });

    const { result } = renderHook(() => useStreak("America/Sao_Paulo"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.streak).toBe(5);
    expect(getStreak).toHaveBeenCalledWith("America/Sao_Paulo");
  });
});
