import { z } from "zod";

export const userProfileResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
