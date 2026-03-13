import type {
  CreateGymInput,
  GymRepository,
  GymResult,
  UpdateGymInput,
} from "../../../../domain/gym/repositories/gym.repository.js";
import { prisma } from "../../../../lib/db.js";
import { toGymResult } from "../mappers/gym.mapper.js";

export class PrismaGymRepository implements GymRepository {
  async create(input: CreateGymInput): Promise<GymResult> {
    const gym = await prisma.gym.create({
      data: {
        name: input.name,
        ownerId: input.ownerId,
        maxInstructors: input.maxInstructors ?? 10,
        maxStudents: input.maxStudents ?? 50,
      },
    });
    return toGymResult(gym);
  }

  async findById(id: string): Promise<GymResult | null> {
    const gym = await prisma.gym.findUnique({
      where: { id },
    });
    return gym ? toGymResult(gym) : null;
  }

  async findByOwnerId(ownerId: string): Promise<GymResult | null> {
    const gym = await prisma.gym.findUnique({
      where: { ownerId },
    });
    return gym ? toGymResult(gym) : null;
  }

  async update(id: string, input: UpdateGymInput): Promise<GymResult | null> {
    const existing = await prisma.gym.findUnique({
      where: { id },
    });
    if (!existing) return null;
    const gym = await prisma.gym.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.maxInstructors !== undefined && {
          maxInstructors: input.maxInstructors,
        }),
        ...(input.maxStudents !== undefined && {
          maxStudents: input.maxStudents,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
    return toGymResult(gym);
  }
}
