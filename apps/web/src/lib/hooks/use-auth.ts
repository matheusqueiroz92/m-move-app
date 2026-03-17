"use client";

import { useCallback, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { getMe } from "@/lib/api/users";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useAuth() {
  const {
    user,
    isLoading,
    isInitialized,
    setUser,
    setLoading,
    setInitialized,
    reset,
  } = useAuthStore();

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getMe();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [setUser, setLoading, setInitialized]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const session = await authClient.getSession();
      if (cancelled) return;
      if (!session?.data?.session) {
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }
      await fetchProfile();
    }

    if (!isInitialized) {
      init();
    }
    return () => {
      cancelled = true;
    };
  }, [isInitialized, fetchProfile, setUser, setLoading, setInitialized]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setLoading(false);
        return { ok: false as const, error: result.error.message };
      }
      await fetchProfile();
      return { ok: true as const };
    },
    [fetchProfile, setLoading],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string) => {
      setLoading(true);
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) {
        setLoading(false);
        return { ok: false as const, error: result.error.message };
      }
      await fetchProfile();
      return { ok: true as const };
    },
    [fetchProfile, setLoading],
  );

  const signInWithSocial = useCallback((provider: "google" | "github") => {
    authClient.signIn.social({ provider, callbackURL: "/dashboard" });
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    reset();
  }, [reset]);

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithSocial,
    signOut,
    refetchProfile: fetchProfile,
  };
}
