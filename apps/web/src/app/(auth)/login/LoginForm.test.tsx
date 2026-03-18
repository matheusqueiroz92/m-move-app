import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

const mockPush = vi.fn();
const mockSignInWithEmail = vi.fn();
const mockSignInWithSocial = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    signInWithEmail: mockSignInWithEmail,
    signInWithSocial: mockSignInWithSocial,
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows email and password fields and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("voce@exemplo.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("disables submit while submitting", async () => {
    mockSignInWithEmail.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 50)),
    );
    render(<LoginForm />);
    const email = screen.getByPlaceholderText("voce@exemplo.com");
    const password = screen.getByPlaceholderText("••••••••");
    const submit = screen.getByRole("button", { name: /entrar/i });

    fireEvent.change(email, { target: { value: "a@b.com" } });
    fireEvent.change(password, { target: { value: "12345678" } });
    fireEvent.click(submit);

    expect(submit).toBeDisabled();
    await waitFor(() =>
      expect(mockSignInWithEmail).toHaveBeenCalledWith("a@b.com", "12345678"),
    );
  });

  it("redirects on successful login", async () => {
    mockSignInWithEmail.mockResolvedValue({ ok: true });
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText("voce@exemplo.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows error message on failed login", async () => {
    mockSignInWithEmail.mockResolvedValue({
      ok: false,
      error: "Credenciais inválidas",
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText("voce@exemplo.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /credenciais inválidas/i,
      );
    });
  });
});
