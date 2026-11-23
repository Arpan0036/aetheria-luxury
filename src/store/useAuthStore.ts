"use client";

import { create } from "zustand";
import type { CollectorProfile } from "@/types/database";

export const AUTH_STORAGE_KEY = "aetheria-auth-v1";
export const DEMO_COLLECTOR_ID = "f0000000-0000-4000-8000-000000000001";
export const DEMO_COLLECTOR_EMAIL = "julian.vance@aetheria.studio";

interface AuthStoreState {
  profile: CollectorProfile | null;
  hasHydrated: boolean;

  hydrateAuth: () => void;
  setProfile: (profile: CollectorProfile | null) => void;
  signOut: () => void;
}

function persistAuth(profile: CollectorProfile | null) {
  if (typeof window === "undefined") return;
  try {
    if (profile) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    /* ignore storage restrictions */
  }
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  profile: null,
  hasHydrated: false,

  hydrateAuth: () => {
    if (typeof window === "undefined") return;
    let stored: CollectorProfile | null = null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CollectorProfile;
        if (parsed && typeof parsed.id === "string" && typeof parsed.email === "string") {
          stored = parsed;
        }
      }
    } catch {
      /* ignore */
    }
    set({ profile: stored, hasHydrated: true });
  },

  setProfile: (profile) => {
    persistAuth(profile);
    set({ profile });
  },

  signOut: () => {
    persistAuth(null);
    set({ profile: null });
  },
}));
