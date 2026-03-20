import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "./use-auth";
import { useAuthStore } from "@/lib/stores/auth-store";

const fakeProfile = {
  id: "u1",
  name: "Matheus",
  email: "matheus@example.com",
  role: "STUDENT",
};

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    getSession: vi.fn(),
    signIn: { email: vi.fn(), social: vi.fn() },
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

    // Reset Zustand store between tests to make sure init() runs.
    useAuthStore.setState({
      user: null,
      isLoading: true,
      isInitialized: false,
    });
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

  it("loads user profile when session exists", async () => {
    const { authClient } = await import("@/lib/auth/client");
    const { getMe } = await import("@/lib/api/users");

    vi.mocked(authClient.getSession).mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
      error: null,
    });

    vi.mocked(getMe).mockResolvedValue(fakeProfile);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(fakeProfile);
  });

  it("sets user to null when profile fetch fails", async () => {
    const { authClient } = await import("@/lib/auth/client");
    const { getMe } = await import("@/lib/api/users");

    vi.mocked(authClient.getSession).mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
      error: null,
    });

    vi.mocked(getMe).mockRejectedValue(new Error("DB error"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("returns error when signInWithEmail fails", async () => {
    const { authClient } = await import("@/lib/auth/client");
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      error: { message: "Credenciais inválidas" },
    });

    const { result } = renderHook(() => useAuth());

    const response = await result.current.signInWithEmail("a@b.com", "wrong");

    expect(response).toEqual({
      ok: false,
      error: "Credenciais inválidas",
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("refetches profile and returns ok when signInWithEmail succeeds", async () => {
    const { authClient } = await import("@/lib/auth/client");
    const { getMe } = await import("@/lib/api/users");

    vi.mocked(authClient.signIn.email).mockResolvedValue({});
    vi.mocked(getMe).mockResolvedValue(fakeProfile);

    const { result } = renderHook(() => useAuth());

    const response = await result.current.signInWithEmail(
      "a@b.com",
      "12345678",
    );

    expect(response).toEqual({ ok: true });

    await waitFor(() => {
      expect(result.current.user).toEqual(fakeProfile);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });
  });

  it("returns error when signUpWithEmail fails", async () => {
    const { authClient } = await import("@/lib/auth/client");
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      error: { message: "Erro ao cadastrar" },
    });

    const { result } = renderHook(() => useAuth());

    const response = await result.current.signUpWithEmail(
      "a@b.com",
      "12345678",
      "John",
    );

    expect(response).toEqual({
      ok: false,
      error: "Erro ao cadastrar",
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("signInWithSocial triggers correct provider and callbackURL", async () => {
    const { authClient } = await import("@/lib/auth/client");

    const { result } = renderHook(() => useAuth());
    result.current.signInWithSocial("google");

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/dashboard",
    });
  });

  it("signOut resets auth store", async () => {
    const { authClient } = await import("@/lib/auth/client");
    vi.mocked(authClient.signOut).mockResolvedValue(undefined);
    vi.mocked(authClient.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    useAuthStore.setState({
      user: fakeProfile,
      isLoading: true,
      isInitialized: false,
    });

    const { result } = renderHook(() => useAuth());

    await result.current.signOut();

    expect(authClient.signOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
