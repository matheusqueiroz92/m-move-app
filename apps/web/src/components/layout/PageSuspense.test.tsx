import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageSuspense } from "./PageSuspense";

describe("PageSuspense", () => {
  it("renders children when provided", () => {
    render(
      <PageSuspense>
        <span>Child content</span>
      </PageSuspense>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("accepts fallbackLabel prop", () => {
    render(
      <PageSuspense fallbackLabel="Aguarde">
        <span>Child</span>
      </PageSuspense>,
    );
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});
