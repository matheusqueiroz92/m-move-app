import { PrismaPg } from "@prisma/adapter-pg";

import type { TransactionClient } from "../domain/database/transaction-client.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

const connectionString =
  env.NODE_ENV === "test" && env.TEST_DATABASE_URL
    ? env.TEST_DATABASE_URL
    : env.DATABASE_URL!;

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function runTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => fn(tx as TransactionClient));
}
