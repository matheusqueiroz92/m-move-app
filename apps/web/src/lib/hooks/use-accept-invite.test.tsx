import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAcceptInvite } from "./use-accept-invite";

const acceptPtInvite = vi.fn();
const acceptGymInvite = vi.fn();

vi.mock("@/lib/api/pt-invites", () => ({
  acceptPtInvite: (token: string) => acceptPtInvite(token),
}));
vi.mock("@/lib/api/gym", () => ({
  acceptGymInvite: (token: string) => acceptGymInvite(token),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useAcceptInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok and source pt when PT invite succeeds", async () => {
    acceptPtInvite.mockResolvedValue(undefined);
    acceptGymInvite.mockRejectedValue(new Error("not gym"));

    const { result } = renderHook(() => useAcceptInvite(), { wrapper });

    result.current.mutate("token-pt");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ ok: true, source: "pt" });
    expect(acceptPtInvite).toHaveBeenCalledWith("token-pt");
  });

  it("returns ok and source gym when PT fails and Gym succeeds", async () => {
    acceptPtInvite.mockRejectedValue(new Error("not pt"));
    acceptGymInvite.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAcceptInvite(), { wrapper });

    result.current.mutate("token-gym");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ ok: true, source: "gym" });
    expect(acceptPtInvite).toHaveBeenCalledWith("token-gym");
    expect(acceptGymInvite).toHaveBeenCalledWith("token-gym");
  });

  it("returns ok false and error when both fail", async () => {
    acceptPtInvite.mockRejectedValue(new Error("invalid"));
    acceptGymInvite.mockRejectedValue(new Error("invalid"));

    const { result } = renderHook(() => useAcceptInvite(), { wrapper });

    result.current.mutate("bad-token");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      ok: false,
      error: "Convite inválido ou expirado.",
    });
  });
});
