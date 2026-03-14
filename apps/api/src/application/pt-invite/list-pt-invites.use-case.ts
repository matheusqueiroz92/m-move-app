import type {
  PtStudentLinkRepository,
  PtStudentLinkResult,
} from "../../domain/pt-invite/repositories/pt-student-link.repository.js";

export interface ListPtInvitesInput {
  personalTrainerId: string;
  limit: number;
  offset: number;
}

export interface ListPtInvitesResult {
  items: PtStudentLinkResult[];
  total: number;
  limit: number;
  offset: number;
}

export class ListPtInvitesUseCase {
  constructor(private readonly repository: PtStudentLinkRepository) {}

  async execute(input: ListPtInvitesInput): Promise<ListPtInvitesResult> {
    const { items, total } =
      await this.repository.findByPersonalTrainerIdPaginated(
        input.personalTrainerId,
        { limit: input.limit, offset: input.offset },
      );
    return {
      items,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }
}
