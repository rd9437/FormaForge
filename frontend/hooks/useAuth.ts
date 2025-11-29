import { useEffect } from "react";
import { create } from "zustand";
import { authApi } from "@/lib/api-client";
import type { UserProfile } from "@/types";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

type SetState<T> = (
  partial: Partial<T> | T | ((state: T) => Partial<T> | T),
  replace?: boolean
) => void;

const authStoreCreator = (set: SetState<AuthState>): AuthState => ({
  user: null,
  loading: true,
  setUser: (user: UserProfile | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading })
});

export const useAuthStore = create<AuthState>(authStoreCreator);

export function useEnsureProfile() {
  const { setUser, setLoading, user } = useAuthStore();

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      try {
        const profile = await authApi.profile();
        if (active) {
          setUser(profile.user);
        }
      } catch (error) {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (!user) {
      fetchProfile().catch(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [setLoading, setUser, user]);
}
