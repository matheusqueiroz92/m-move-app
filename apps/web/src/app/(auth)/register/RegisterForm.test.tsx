import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RegisterForm from "./RegisterForm";

const mockPush = vi.fn();
const mockSignUpWithEmail = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    signUpWithEmail: mockSignUpWithEmail,
  }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows name, email, password fields and submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByPlaceholderText("Seu nome")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("email@exemplo.com"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cadastrar/i }),
    ).toBeInTheDocument();
  });

  it("disables submit while submitting", async () => {
    mockSignUpWithEmail.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 50)),
    );

    render(<RegisterForm />);

    const name = screen.getByPlaceholderText("Seu nome");
    const email = screen.getByPlaceholderText("email@exemplo.com");
    const password = screen.getByPlaceholderText("••••••••");
    const submit = screen.getByRole("button", { name: /cadastrar/i });

    fireEvent.change(name, { target: { value: "John Doe" } });
    fireEvent.change(email, { target: { value: "john@example.com" } });
    fireEvent.change(password, { target: { value: "12345678" } });
    fireEvent.click(submit);

    expect(submit).toBeDisabled();

    await waitFor(() =>
      expect(mockSignUpWithEmail).toHaveBeenCalledWith(
        "john@example.com",
        "12345678",
        "John Doe",
      ),
    );
  });

  it("redirects on successful registration", async () => {
    mockSignUpWithEmail.mockResolvedValue({ ok: true });
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows error message on failed registration", async () => {
    mockSignUpWithEmail.mockResolvedValue({
      ok: false,
      error: "Falha ao cadastrar",
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /falha ao cadastrar/i,
      );
    });
  });
});
