"use client";

import { create } from "zustand";
import { useCartStore } from "./useCartStore";
import type { CatalogProduct, CategorySlug, ProductVariant } from "@/types/database";

export const WISHLIST_STORAGE_KEY = "aetheria-wishlist-v1";

export interface WishlistVariantSnapshot {
  id: string;
  sku: string;
  variant_name: string;
  color_hex: string;
  price_modifier_usd: number;
  stock_count: number;
}

export interface WishlistItem {
  productId: string;
  slug: string;
  sku: string;
  title: string;
  image: string;
  priceUsd: number;
  tagline: string;
  categoryName: string;
  defaultVariant: WishlistVariantSnapshot;
}

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

export function buildWishlistItemFromProduct(
  product: CatalogProduct,
  variant?: ProductVariant | null,
): WishlistItem {
  const v = variant ?? product.variants?.[0];
  return {
    productId: product.id,
    slug: product.slug,
    sku: v?.sku ?? product.sku,
    title: product.title,
    image: product.images?.[0] ?? "/images/products/aether-01-headphones.png",
    priceUsd: product.price_usd + (v?.price_modifier_usd ?? 0),
    tagline: product.tagline,
    categoryName: CATEGORY_LABELS[product.category_slug] ?? "Archive Object",
    defaultVariant: v
      ? {
          id: v.id,
          sku: v.sku,
          variant_name: v.variant_name,
          color_hex: v.color_hex,
          price_modifier_usd: v.price_modifier_usd,
          stock_count: v.stock_count,
        }
      : {
          id: "default",
          sku: product.sku,
          variant_name: product.three_d_config.finish,
          color_hex: product.three_d_config.base_hex,
          price_modifier_usd: 0,
          stock_count: product.stock_count,
        },
  };
}

function persistWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage blocked */
  }
}

interface WishlistStoreState {
  items: WishlistItem[];
  isOpen: boolean;
  hasHydrated: boolean;

  hydrateWishlist: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  toggleWishlistItem: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  removeWishlistItem: (productId: string) => void;
  moveItemToCart: (productId: string) => void;
  moveAllToCart: () => void;
}

export const useWishlistStore = create<WishlistStoreState>((set, get) => ({
  items: [],
  isOpen: false,
  hasHydrated: false,

  hydrateWishlist: () => {
    if (typeof window === "undefined") return;
    let items: WishlistItem[] = [];
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed;
      }
    } catch {
      /* ignore malformed storage */
    }
    set({ items, hasHydrated: true });
  },

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  toggleWishlistItem: (item) => {
    const current = get().items;
    const exists = current.some((i) => i.productId === item.productId);
    const next = exists
      ? current.filter((i) => i.productId !== item.productId)
      : [item, ...current];
    persistWishlist(next);
    set({ items: next });
  },

  isInWishlist: (productId) => get().items.some((i) => i.productId === productId),

  removeWishlistItem: (productId) => {
    const next = get().items.filter((i) => i.productId !== productId);
    persistWishlist(next);
    set({ items: next });
  },

  moveItemToCart: (productId) => {
    const target = get().items.find((i) => i.productId === productId);
    if (!target) return;
    useCartStore.getState().addItem(
      {
        productId: target.productId,
        slug: target.slug,
        sku: target.defaultVariant.sku || target.sku,
        title: target.title,
        image: target.image,
        categoryName: target.categoryName,
        unitPriceUsd: target.priceUsd,
        variantId: target.defaultVariant.id,
        variantName: target.defaultVariant.variant_name,
        colorHex: target.defaultVariant.color_hex,
        maxStock: Math.max(1, target.defaultVariant.stock_count || 10),
        quantity: 1,
      },
      true,
    );
    const next = get().items.filter((i) => i.productId !== productId);
    persistWishlist(next);
    set({ items: next, isOpen: false });
  },

  moveAllToCart: () => {
    const current = get().items;
    if (!current.length) return;
    const cart = useCartStore.getState();
    for (const target of current) {
      cart.addItem(
        {
          productId: target.productId,
          slug: target.slug,
          sku: target.defaultVariant.sku || target.sku,
          title: target.title,
          image: target.image,
          categoryName: target.categoryName,
          unitPriceUsd: target.priceUsd,
          variantId: target.defaultVariant.id,
          variantName: target.defaultVariant.variant_name,
          colorHex: target.defaultVariant.color_hex,
          maxStock: Math.max(1, target.defaultVariant.stock_count || 10),
          quantity: 1,
        },
        false,
      );
    }
    persistWishlist([]);
    set({ items: [], isOpen: false });
    cart.setOpen(true);
  },
}));
