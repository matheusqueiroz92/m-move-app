import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, openAPI } from "better-auth/plugins";

import { ResendEmailProvider } from "../infrastructure/providers/resend-email-provider.js";
import { prisma } from "./db.js";
import { executeBetterAuthPasswordResetEmail } from "./email/execute-better-auth-password-reset-email.js";
import { env } from "./env.js";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export const auth = betterAuth({
  baseURL: env.API_BASE_URL,
  trustedOrigins: [env.WEB_APP_BASE_URL || "http://localhost:3001"],
  session: {
    expiresIn: THIRTY_DAYS_SECONDS,
    updateAge: 60 * 60 * 24, // 1 day - refresh session on use
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await executeBetterAuthPasswordResetEmail(
        { user, url },
        {
          resendApiKey: env.RESEND_API_KEY,
          apiBaseUrl: env.API_BASE_URL,
          webAppBaseUrl: env.WEB_APP_BASE_URL,
          resendFromOverride: env.RESEND_FROM_EMAIL,
          createEmailSender: (key) => new ResendEmailProvider(key),
        },
      );
    },
  },
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID &&
      env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }),
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [openAPI(), bearer()],
  advanced: {
    // Em desenvolvimento (HTTP), cookies Secure são rejeitados pelo navegador.
    // Desabilita Secure para que a sessão funcione no Scalar/docs e no app em localhost.
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: true,
      domain: env.NODE_ENV === "production" ? "development" : undefined,
    },
  },
});
