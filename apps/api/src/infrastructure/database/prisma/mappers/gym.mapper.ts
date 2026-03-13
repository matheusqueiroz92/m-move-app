import type { GymResult } from "../../../../domain/gym/repositories/gym.repository.js";
import type { Gym } from "../../../../generated/prisma/client.js";

export function toGymResult(gym: Gym): GymResult {
  return {
    id: gym.id,
    name: gym.name,
    ownerId: gym.ownerId,
    maxInstructors: gym.maxInstructors,
    maxStudents: gym.maxStudents,
    isActive: gym.isActive,
    createdAt: gym.createdAt,
    updatedAt: gym.updatedAt,
  };
}
