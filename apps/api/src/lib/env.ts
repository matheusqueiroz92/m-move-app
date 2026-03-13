import "dotenv/config";

import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().startsWith("postgresql://").optional(),
    TEST_DATABASE_URL: z.string().startsWith("postgresql://").optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    API_BASE_URL: z.url().default("http://localhost:3001"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    WEB_APP_BASE_URL: z.url().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  })
  .refine(
    (data) =>
      data.NODE_ENV !== "test" || Boolean(data.TEST_DATABASE_URL),
    {
      message:
        "TEST_DATABASE_URL is required when NODE_ENV is test",
      path: ["TEST_DATABASE_URL"],
    }
  )
  .refine(
    (data) =>
      data.NODE_ENV === "test" || Boolean(data.DATABASE_URL),
    {
      message: "DATABASE_URL is required when NODE_ENV is not test",
      path: ["DATABASE_URL"],
    }
  )
  .refine(
    (data) =>
      data.NODE_ENV === "test" ||
      (Boolean(data.BETTER_AUTH_SECRET) &&
        Boolean(data.GOOGLE_CLIENT_ID) &&
        Boolean(data.GOOGLE_CLIENT_SECRET) &&
        Boolean(data.GOOGLE_GENERATIVE_AI_API_KEY) &&
        Boolean(data.WEB_APP_BASE_URL)),
    {
      message:
        "BETTER_AUTH_SECRET, GOOGLE_*, GOOGLE_GENERATIVE_AI_API_KEY and WEB_APP_BASE_URL are required when NODE_ENV is not test",
    }
  );

export const env = envSchema.parse(process.env);
