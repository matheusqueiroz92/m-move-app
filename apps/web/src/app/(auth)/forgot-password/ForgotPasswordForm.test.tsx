import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ForgotPasswordForm from "./ForgotPasswordForm";

const mockSubmitForgotPassword = vi.fn();

let hookState: {
  isPending: boolean;
  isSuccess: boolean;
  data?: { ok: boolean; message?: string } | undefined;
  isError: boolean;
  error: Error | null;
} = {
  isPending: false,
  isSuccess: false,
  data: undefined,
  isError: false,
  error: null,
};

vi.mock("@/lib/hooks/use-forgot-password", () => ({
  useForgotPassword: () => ({
    mutateAsync: mockSubmitForgotPassword,
    isPending: hookState.isPending,
    isSuccess: hookState.isSuccess,
    data: hookState.data,
    isError: hookState.isError,
    error: hookState.error,
  }),
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookState = {
      isPending: false,
      isSuccess: false,
      data: undefined,
      isError: false,
      error: null,
    };
  });

  it("shows email field and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar link/i }),
    ).toBeInTheDocument();
  });

  it("submits email and calls mutateAsync", async () => {
    mockSubmitForgotPassword.mockResolvedValue(undefined);
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    await waitFor(() =>
      expect(mockSubmitForgotPassword).toHaveBeenCalledWith("user@example.com"),
    );
  });

  it("shows pending state when isPending is true", async () => {
    hookState = {
      isPending: true,
      isSuccess: false,
      data: undefined,
      isError: false,
      error: null,
    };

    render(<ForgotPasswordForm />);

    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled();
  });

  it("shows success message when isSuccess and data.ok are true", async () => {
    hookState = {
      isPending: false,
      isSuccess: true,
      data: { ok: true },
      isError: false,
      error: null,
    };

    render(<ForgotPasswordForm />);

    expect(
      screen.getByText(/link para redefinir a senha/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("seu@email.com"),
    ).not.toBeInTheDocument();
  });

  it("shows error message when isError is true", async () => {
    hookState = {
      isPending: false,
      isSuccess: false,
      data: undefined,
      isError: true,
      error: new Error("Falha de rede"),
    };

    render(<ForgotPasswordForm />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/falha de rede/i),
    );
  });
});
