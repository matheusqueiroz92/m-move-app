import { PtInviteNotFoundError } from "../../domain/pt-invite/errors/pt-invite-not-found.error.js";
import type { PtStudentLinkRepository } from "../../domain/pt-invite/repositories/pt-student-link.repository.js";

export interface RevokePtInviteInput {
  inviteId: string;
  personalTrainerId: string;
}

export class RevokePtInviteUseCase {
  constructor(private readonly repository: PtStudentLinkRepository) {}

  async execute(input: RevokePtInviteInput): Promise<void> {
    const link = await this.repository.findById(input.inviteId);
    if (!link || link.personalTrainerId !== input.personalTrainerId) {
      throw new PtInviteNotFoundError(input.inviteId);
    }
    await this.repository.updateStatus(
      input.inviteId,
      "REVOKED",
      undefined,
      new Date(),
      undefined,
    );
  }
}
