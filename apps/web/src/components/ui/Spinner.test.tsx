import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders with default size and role status", () => {
    render(<Spinner />);
    const el = screen.getByRole("status", { name: /carregando/i });
    expect(el).toBeInTheDocument();
  });

  it("renders with label when provided", () => {
    render(<Spinner label="Aguarde..." />);
    expect(screen.getByText("Aguarde...")).toBeInTheDocument();
  });

  it("applies fullScreen class when fullScreen is true", () => {
    const { container } = render(<Spinner fullScreen />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/min-h-screen/);
  });

  it("applies size class for sm", () => {
    const { container } = render(<Spinner size="sm" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.className).toMatch(/h-5/);
  });
});
