import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResendEmailProvider } from "./resend-email-provider.js";

const mockSend = vi.hoisted(() => vi.fn());

const MockResend = vi.hoisted(() =>
  vi.fn().mockImplementation(function (this: unknown) {
    return {
      emails: { send: mockSend },
    };
  }),
);

vi.mock("resend", () => ({
  Resend: MockResend,
}));

describe("ResendEmailProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when Resend returns error", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "Invalid API key" },
    });
    const provider = new ResendEmailProvider("re_bad");
    await expect(
      provider.sendTransactionalEmail({
        from: "no-reply@test.com",
        to: "u@test.com",
        subject: "Hi",
        html: "<p>x</p>",
      }),
    ).rejects.toThrow("Invalid API key");
  });

  it("returns id when send succeeds", async () => {
    mockSend.mockResolvedValue({
      data: { id: "re_abc" },
      error: null,
    });
    const provider = new ResendEmailProvider("re_ok");
    const result = await provider.sendTransactionalEmail({
      from: "no-reply@test.com",
      to: "u@test.com",
      subject: "Hi",
      html: "<p>x</p>",
      text: "x",
    });
    expect(result).toEqual({ id: "re_abc" });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "no-reply@test.com",
        to: "u@test.com",
        subject: "Hi",
      }),
    );
  });
});
