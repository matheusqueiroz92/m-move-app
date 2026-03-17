import { createAuthClient } from "better-auth/react";

// In browser use same origin so Next.js rewrites /api to the backend (cookies work).
const baseURL =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

export const authClient = createAuthClient({
  baseURL: baseURL || undefined,
  fetchOptions: {
    credentials: "include",
  },
});
