import { describe, expect, it, vi } from "vitest";

import type { EmailSender } from "../../domain/email/email-sender.interface.js";
import { executeBetterAuthPasswordResetEmail } from "./execute-better-auth-password-reset-email.js";

describe("executeBetterAuthPasswordResetEmail", () => {
  it("throws when RESEND_API_KEY is missing", async () => {
    await expect(
      executeBetterAuthPasswordResetEmail(
        { user: { email: "a@b.com" }, url: "http://localhost:3001/r" },
        {
          resendApiKey: undefined,
          apiBaseUrl: "http://localhost:3001",
          webAppBaseUrl: "http://localhost:3000",
          resendFromOverride: undefined,
          createEmailSender: () =>
            ({ sendTransactionalEmail: vi.fn() }) satisfies EmailSender,
        },
      ),
    ).rejects.toThrow(/RESEND_API_KEY/);
  });

  it("sends email with web origin in reset URL when WEB_APP_BASE_URL is set", async () => {
    const sendTransactionalEmail = vi.fn().mockResolvedValue({ id: "x" });
    const createEmailSender = vi.fn(
      (): EmailSender => ({ sendTransactionalEmail }),
    );

    await executeBetterAuthPasswordResetEmail(
      {
        user: { email: "user@test.com" },
        url: "http://localhost:3001/api/auth/reset-password?token=t",
      },
      {
        resendApiKey: "re_test",
        apiBaseUrl: "http://localhost:3001",
        webAppBaseUrl: "http://localhost:3000",
        resendFromOverride: undefined,
        createEmailSender,
      },
    );

    expect(createEmailSender).toHaveBeenCalledWith("re_test");
    expect(sendTransactionalEmail).toHaveBeenCalledTimes(1);
    const payload = sendTransactionalEmail.mock.calls[0]?.[0];
    expect(payload?.to).toBe("user@test.com");
    expect(payload?.html).toContain(
      "http://localhost:3000/api/auth/reset-password",
    );
    expect(payload?.from).toBe("no-reply@localhost");
  });

  it("uses RESEND_FROM_EMAIL when provided", async () => {
    const sendTransactionalEmail = vi.fn().mockResolvedValue({ id: "x" });

    await executeBetterAuthPasswordResetEmail(
      { user: { email: "u@x.com" }, url: "http://localhost:3001/x" },
      {
        resendApiKey: "re_test",
        apiBaseUrl: "http://localhost:3001",
        webAppBaseUrl: "https://app.com",
        resendFromOverride: "noreply@verified.com",
        createEmailSender: () => ({ sendTransactionalEmail }),
      },
    );

    const payload = sendTransactionalEmail.mock.calls[0]?.[0];
    expect(payload?.from).toBe("noreply@verified.com");
  });
});
