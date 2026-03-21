import { describe, expect, it, vi } from "vitest";

import type { EmailSender } from "../../domain/email/email-sender.interface.js";
import { sendPasswordResetEmail } from "./password-reset-email.js";

describe("sendPasswordResetEmail", () => {
  it("calls email sender with subject, html, text and reset link", async () => {
    const sendTransactionalEmail = vi.fn().mockResolvedValue({ id: "msg_1" });
    const emailSender: EmailSender = { sendTransactionalEmail };

    const result = await sendPasswordResetEmail({
      emailSender,
      from: "no-reply@app.com",
      to: "user@app.com",
      resetUrl: "https://app.com/reset?token=t",
    });

    expect(result).toEqual({ id: "msg_1" });
    expect(sendTransactionalEmail).toHaveBeenCalledTimes(1);
    const call = sendTransactionalEmail.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call?.from).toBe("no-reply@app.com");
    expect(call?.to).toBe("user@app.com");
    expect(call?.subject).toContain("Redefinição");
    expect(call?.html).toContain("https://app.com/reset?token=t");
    expect(call?.text).toContain("https://app.com/reset?token=t");
  });
});
