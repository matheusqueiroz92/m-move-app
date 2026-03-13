import { z } from "zod";

export const createCheckoutBodySchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
export type CreateCheckoutBody = z.infer<typeof createCheckoutBodySchema>;

export const createPortalBodySchema = z.object({
  returnUrl: z.string().url(),
});
export type CreatePortalBody = z.infer<typeof createPortalBodySchema>;

export const subscriptionStatusResponseSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    stripeSubscriptionId: z.string(),
    stripePriceId: z.string(),
    planType: z.enum(["STUDENT", "PERSONAL", "GYM"]),
    status: z.enum([
      "ACTIVE",
      "TRIALING",
      "PAST_DUE",
      "CANCELED",
      "UNPAID",
    ]),
    currentPeriodStart: z.string(),
    currentPeriodEnd: z.string(),
    cancelAtPeriodEnd: z.boolean(),
    trialEnd: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .nullable();
export type SubscriptionStatusResponse = z.infer<
  typeof subscriptionStatusResponseSchema
>;

export const checkoutSessionResponseSchema = z.object({
  url: z.string(),
  sessionId: z.string(),
});

export const portalSessionResponseSchema = z.object({
  url: z.string(),
});
