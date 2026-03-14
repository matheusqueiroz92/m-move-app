/**
 * Opaque type for database transaction client.
 * Infrastructure (Prisma) provides the actual implementation.
 */
export type TransactionClient = object;

export interface TransactionRunner {
  run<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T>;
}
