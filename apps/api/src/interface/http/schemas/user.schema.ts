import { z } from "zod";

export const userProfileResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
