import axios from "axios";

// In browser use same origin so Next.js rewrites /api to the backend (cookies work).
const baseURL =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or unauthenticated; consumer can redirect to login
    }
    return Promise.reject(error);
  },
);
