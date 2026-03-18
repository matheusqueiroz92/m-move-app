import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useForgotPassword } from "./use-forgot-password";

const forgetPassword = vi.fn();

vi.mock("@/lib/api/auth", () => ({
  forgetPassword: (email: string) => forgetPassword(email),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls forgetPassword with email and resolves", async () => {
    forgetPassword.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    result.current.mutateAsync("user@example.com");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(forgetPassword).toHaveBeenCalledWith("user@example.com");
  });

  it("sets error when forgetPassword fails", async () => {
    forgetPassword.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    result.current.mutate("user@example.com");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
