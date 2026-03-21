/**
 * Contrato para envio de e-mails transacionais (infraestrutura plugável).
 */
export type SendTransactionalEmailParams = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailSender {
  sendTransactionalEmail(
    params: SendTransactionalEmailParams,
  ): Promise<{ id: string }>;
}
