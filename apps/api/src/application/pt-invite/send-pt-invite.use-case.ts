import { PtStudentLimitReachedError } from "../../domain/pt-invite/errors/pt-student-limit-reached.error.js";
import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";
import type { UserRepository } from "../../domain/user/repositories/user.repository.js";

/** RN-012: PERSONAL plan limit (payments rule) */
const PERSONAL_PLAN_MAX_STUDENTS = 10;

export interface SendPtInviteInput {
  personalTrainerId: string;
  inviteEmail: string;
  inviteToken: string;
  inviteExpiresAt: Date;
}

/** RN-012: Reject send invite when PT has reached plan student limit */
export class SendPtInviteUseCase {
  constructor(
    private readonly repository: PtStudentLinkRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: SendPtInviteInput): Promise<PtStudentLinkResult> {
    const userPlan = await this.userRepository.findByIdWithPlanAndTimezone(
      input.personalTrainerId,
    );
    if (userPlan?.planType === "PERSONAL") {
      const activeCount = await this.repository.countActiveByPersonalTrainerId(
        input.personalTrainerId,
      );
      if (activeCount >= PERSONAL_PLAN_MAX_STUDENTS) {
        throw new PtStudentLimitReachedError(PERSONAL_PLAN_MAX_STUDENTS);
      }
    }

    return this.repository.create({
      personalTrainerId: input.personalTrainerId,
      inviteEmail: input.inviteEmail,
      inviteToken: input.inviteToken,
      inviteExpiresAt: input.inviteExpiresAt,
    });
  }
}
