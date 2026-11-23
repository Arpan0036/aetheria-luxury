"use client";

import { create } from "zustand";
import { THEME_STORAGE_KEY, type CurrencyCode } from "@/lib/utils";
import type { CatalogProduct, CategorySlug } from "@/types/database";

export type Theme = "daylight" | "espresso";

const WISHLIST_STORAGE_KEY = "aetheria-wishlist";

interface UIState {
  theme: Theme;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  activeCurrency: CurrencyCode;
  cartCount: number;
  /** Increments on every add — lets the bag pill re-trigger its pulse animation. */
  cartPulse: number;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setCurrency: (code: CurrencyCode) => void;
  addToCart: (qty?: number) => void;
  /** Active archive filter — shared so the Bento grid can drive the catalog. */
  catalogCategory: CategorySlug | "all";
  setCatalogCategory: (slug: CategorySlug | "all") => void;
  /** Product currently open in the 3D Quick-Inspect modal. */
  quickInspectProduct: CatalogProduct | null;
  setQuickInspectProduct: (product: CatalogProduct | null) => void;
  /** Collector wishlist SKUs persisted in localStorage. */
  wishlistSkus: string[];
  toggleWishlist: (sku: string) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage blocked — theme still applies for this session */
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "daylight",
  isMobileMenuOpen: false,
  isSearchOpen: false,
  activeCurrency: "USD",
  cartCount: 2,
  cartPulse: 0,

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "daylight" ? "espresso" : "daylight"),
  /** Sync store with whatever the pre-paint inline script applied to <html>. */
  hydrateTheme: () => {
    let stored: string | null = null;
    let storedWishlist: string[] = [];
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
      const rawWish = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (rawWish) {
        const parsed = JSON.parse(rawWish);
        if (Array.isArray(parsed)) storedWishlist = parsed.map(String);
      }
    } catch {}
    const theme: Theme = stored === "espresso" ? "espresso" : "daylight";
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme, wishlistSkus: storedWishlist });
  },
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  setCurrency: (code) => set({ activeCurrency: code }),
  addToCart: (qty = 1) =>
    set((s) => ({ cartCount: Math.min(99, s.cartCount + qty), cartPulse: s.cartPulse + 1 })),
  catalogCategory: "all",
  setCatalogCategory: (slug) => set({ catalogCategory: slug }),
  quickInspectProduct: null,
  setQuickInspectProduct: (product) => set({ quickInspectProduct: product }),
  wishlistSkus: [],
  toggleWishlist: (sku) =>
    set((s) => {
      const next = s.wishlistSkus.includes(sku)
        ? s.wishlistSkus.filter((id) => id !== sku)
        : [...s.wishlistSkus, sku];
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return { wishlistSkus: next };
    }),
}));
