import { describe, it, expect } from "vitest";
import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
  it("formats seconds only (e.g. 0:45)", () => {
    expect(formatDuration(45)).toBe("0:45");
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(59)).toBe("0:59");
  });

  it("formats minutes and seconds (e.g. 1:30)", () => {
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("formats hours, minutes and seconds (e.g. 2:05:00)", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(7500)).toBe("2:05:00");
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("returns 0:00 for invalid input", () => {
    expect(formatDuration(-1)).toBe("0:00");
    expect(formatDuration(1.5)).toBe("0:00");
  });
});
