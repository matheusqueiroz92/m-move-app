import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AcceptInvitePage from "./page";

const mockPush = vi.fn();
const mockAcceptInvite = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("?token=abc123"),
}));

vi.mock("@/lib/hooks/use-accept-invite", () => ({
  useAcceptInvite: () => ({
    mutate: mockAcceptInvite,
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: null,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("AcceptInvitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and calls accept with token from URL", async () => {
    render(<AcceptInvitePage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/aceitar convite/i)).toBeInTheDocument();
    });
    expect(mockAcceptInvite).toHaveBeenCalledWith("abc123");
  });
});
