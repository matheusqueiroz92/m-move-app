import { Resend } from "resend";

import type {
  EmailSender,
  SendTransactionalEmailParams,
} from "../../domain/email/email-sender.interface.js";

export class ResendEmailProvider implements EmailSender {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async sendTransactionalEmail(
    params: SendTransactionalEmailParams,
  ): Promise<{ id: string }> {
    const { data, error } = await this.client.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { id: data?.id ?? "" };
  }
}
