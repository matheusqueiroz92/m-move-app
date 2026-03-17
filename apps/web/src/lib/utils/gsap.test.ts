import { describe, it, expect, vi, beforeEach } from "vitest";
import { animateIn, animateElement } from "./gsap";

describe("gsap utils", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("animateIn does not throw when element is null", () => {
    expect(() => animateIn(null)).not.toThrow();
  });

  it("animateElement does not throw when element is null", () => {
    expect(() => animateElement(null)).not.toThrow();
  });
});
