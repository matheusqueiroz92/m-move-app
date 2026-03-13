import { InviteAlreadyUsedError } from "../../domain/pt-invite/errors/invite-already-used.error.js";
import { InviteExpiredError } from "../../domain/pt-invite/errors/invite-expired.error.js";
import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";

export interface AcceptPtInviteInput {
  token: string;
  studentId: string;
}

export class AcceptPtInviteUseCase {
  constructor(private readonly repository: PtStudentLinkRepository) {}

  async execute(input: AcceptPtInviteInput): Promise<PtStudentLinkResult> {
    const link = await this.repository.findByToken(input.token);
    if (!link) {
      throw new InviteExpiredError(input.token);
    }
    if (link.inviteExpiresAt < new Date()) {
      throw new InviteExpiredError(input.token);
    }
    if (link.status !== "PENDING") {
      throw new InviteAlreadyUsedError(input.token);
    }

    const updated = await this.repository.updateStatus(
      link.id,
      "ACTIVE",
      new Date(),
      undefined,
      input.studentId,
    );
    if (!updated) {
      throw new InviteExpiredError(input.token);
    }
    return updated;
  }
}
