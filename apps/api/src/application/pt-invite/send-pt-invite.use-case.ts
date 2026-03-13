import type {
  CreatePtStudentLinkInput,
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";

export interface SendPtInviteInput {
  personalTrainerId: string;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
}

export class SendPtInviteUseCase {
  constructor(private readonly repository: PtStudentLinkRepository) {}

  async execute(input: SendPtInviteInput): Promise<PtStudentLinkResult> {
    return this.repository.create({
      personalTrainerId: input.personalTrainerId,
      inviteEmail: input.inviteEmail,
      inviteToken: input.inviteToken,
      inviteExpiresAt: input.inviteExpiresAt,
    });
  }
}
