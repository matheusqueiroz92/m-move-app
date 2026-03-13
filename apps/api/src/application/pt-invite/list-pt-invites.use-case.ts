import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";

export interface ListPtInvitesInput {
  personalTrainerId: string;
}

export class ListPtInvitesUseCase {
  constructor(private readonly repository: PtStudentLinkRepository) {}

  async execute(input: ListPtInvitesInput): Promise<PtStudentLinkResult[]> {
    return this.repository.findByPersonalTrainerId(input.personalTrainerId);
  }
}
