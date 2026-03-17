import type { UserProfile } from "@m-move-app/types";
import { create } from "zustand";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (value) => set({ isInitialized: value }),
  reset: () =>
    set({
      user: null,
      isLoading: false,
      isInitialized: true,
    }),
}));
