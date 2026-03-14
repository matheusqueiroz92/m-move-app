import type {
  GymStudentLinkRepository,
  GymStudentLinkResult,
} from "../../domain/gym/repositories/gym-student-link.repository.js";
import { InviteAlreadyUsedError } from "../../domain/pt-invite/errors/invite-already-used.error.js";
import { InviteExpiredError } from "../../domain/pt-invite/errors/invite-expired.error.js";

export interface AcceptGymInviteInput {
  token: string;
  studentId: string;
}

export class AcceptGymInviteUseCase {
  constructor(private readonly repository: GymStudentLinkRepository) {}

  async execute(input: AcceptGymInviteInput): Promise<GymStudentLinkResult> {
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
