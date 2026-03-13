import type {
  CreateGymInstructorInput,
  GymInstructorRepository,
  GymInstructorResult,
} from "../../../../domain/gym/repositories/gym-instructor.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toGymInstructorResult } from "../mappers/gym-instructor.mapper.js";

export class PrismaGymInstructorRepository implements GymInstructorRepository {
  async create(input: CreateGymInstructorInput): Promise<GymInstructorResult> {
    const link = await prisma.gymInstructor.create({
      data: {
        gymId: input.gymId,
        inviteEmail: input.inviteEmail,
        inviteToken: input.inviteToken,
        inviteExpiresAt: input.inviteExpiresAt,
      },
    });
    return toGymInstructorResult(link);
  }

  async findById(id: string): Promise<GymInstructorResult | null> {
    const link = await prisma.gymInstructor.findUnique({
      where: { id },
    });
    return link ? toGymInstructorResult(link) : null;
  }

  async findByGymId(gymId: string): Promise<GymInstructorResult[]> {
    const links = await prisma.gymInstructor.findMany({
      where: { gymId },
      orderBy: { createdAt: "desc" },
    });
    return links.map(toGymInstructorResult);
  }

  async countActiveByGymId(gymId: string): Promise<number> {
    return prisma.gymInstructor.count({
      where: {
        gymId,
        status: { in: ["PENDING", "ACTIVE"] },
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await prisma.gymInstructor.deleteMany({
      where: { id },
    });
    return result.count > 0;
  }
}
