import { z } from "zod";

export const sendPtInviteBodySchema = z.object({
  inviteEmail: z.string().email("Invalid email"),
});
export type SendPtInviteBody = z.infer<typeof sendPtInviteBodySchema>;

const linkStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
]);

export const ptInviteResponseSchema = z.object({
  id: z.string(),
  personalTrainerId: z.string(),
  studentId: z.string().nullable(),
  inviteEmail: z.string(),
  inviteToken: z.string(),
  inviteExpiresAt: z.string(),
  status: linkStatusSchema,
  acceptedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type PtInviteResponse = z.infer<typeof ptInviteResponseSchema>;

export const ptInviteListResponseSchema = z.array(ptInviteResponseSchema);

export const acceptPtInviteBodySchema = z.object({
  token: z.string().min(1, "Token is required"),
});
export type AcceptPtInviteBody = z.infer<typeof acceptPtInviteBodySchema>;
