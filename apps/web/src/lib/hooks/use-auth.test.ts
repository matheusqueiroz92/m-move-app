import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "./use-auth";

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    getSession: vi.fn(),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
  },
}));

vi.mock("@/lib/api/users", () => ({
  getMe: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthenticated state when there is no session", async () => {
    const { authClient } = await import("@/lib/auth/client");
    vi.mocked(authClient.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
