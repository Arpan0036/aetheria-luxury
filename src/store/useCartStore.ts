"use client";

import { create } from "zustand";
import { useUIStore } from "./useUIStore";
import type { CatalogProduct, CategorySlug, ConnectionMode, ProductVariant } from "@/types/database";

export const CART_STORAGE_KEY = "aetheria-cart-v1";
export const FREE_SHIPPING_THRESHOLD_USD = 150;
export const FLAT_EXPRESS_SHIPPING_USD = 25;

export interface CartLineItem {
  lineKey: string;
  productId: string;
  slug: string;
  sku: string;
  title: string;
  image: string;
  categoryName: string;
  unitPriceUsd: number;
  variantId: string;
  variantName: string;
  colorHex: string;
  quantity: number;
  maxStock: number;
}

export type CartLineItemInput = Omit<CartLineItem, "lineKey" | "quantity"> & {
  quantity?: number;
};

export interface AppliedPromoCode {
  code: string;
  description: string;
  discount_percent: number;
  min_order_usd: number;
  mode: ConnectionMode;
}

export interface CartFinancials {
  totalItemsCount: number;
  subtotalUsd: number;
  discountAmountUsd: number;
  promoBelowMinimumUsd: number;
  shippingUsd: number;
  freeShippingRemainingUsd: number;
  freeShippingProgressPercent: number;
  grandTotalUsd: number;
}

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

export function makeLineKey(productId: string, variantId?: string | null): string {
  return `${productId}__${variantId || "default"}`;
}

export function buildCartItemFromProduct(
  product: CatalogProduct,
  variant?: ProductVariant | null,
  quantity = 1,
): CartLineItemInput {
  const v = variant ?? product.variants?.[0];
  return {
    productId: product.id,
    slug: product.slug,
    sku: v?.sku ?? product.sku,
    title: product.title,
    image: product.images?.[0] ?? "/images/products/aether-01-headphones.png",
    categoryName: CATEGORY_LABELS[product.category_slug] ?? "Archive Object",
    unitPriceUsd: product.price_usd + (v?.price_modifier_usd ?? 0),
    variantId: v?.id ?? "default",
    variantName: v?.variant_name ?? product.three_d_config.finish,
    colorHex: v?.color_hex ?? product.three_d_config.base_hex,
    maxStock: Math.max(1, v?.stock_count ?? product.stock_count ?? 10),
    quantity,
  };
}

export function computeCartFinancials(
  items: CartLineItem[],
  appliedPromo: AppliedPromoCode | null,
): CartFinancials {
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalUsd =
    Math.round(items.reduce((sum, item) => sum + item.unitPriceUsd * item.quantity, 0) * 100) / 100;

  let discountAmountUsd = 0;
  let promoBelowMinimumUsd = 0;

  if (appliedPromo && subtotalUsd > 0) {
    if (subtotalUsd >= appliedPromo.min_order_usd) {
      discountAmountUsd = Math.round(subtotalUsd * appliedPromo.discount_percent) / 100;
    } else {
      promoBelowMinimumUsd = Math.round((appliedPromo.min_order_usd - subtotalUsd) * 100) / 100;
    }
  }

  const shippingUsd =
    items.length === 0 || subtotalUsd >= FREE_SHIPPING_THRESHOLD_USD
      ? 0
      : FLAT_EXPRESS_SHIPPING_USD;

  const freeShippingRemainingUsd = Math.max(
    0,
    Math.round((FREE_SHIPPING_THRESHOLD_USD - subtotalUsd) * 100) / 100,
  );
  const freeShippingProgressPercent = Math.min(
    100,
    Math.round((subtotalUsd / FREE_SHIPPING_THRESHOLD_USD) * 100),
  );

  const grandTotalUsd = Math.max(
    0,
    Math.round((subtotalUsd - discountAmountUsd + shippingUsd) * 100) / 100,
  );

  return {
    totalItemsCount,
    subtotalUsd,
    discountAmountUsd,
    promoBelowMinimumUsd,
    shippingUsd,
    freeShippingRemainingUsd,
    freeShippingProgressPercent,
    grandTotalUsd,
  };
}

function persistCartState(items: CartLineItem[], appliedPromo: AppliedPromoCode | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, appliedPromo }));
  } catch {
    /* storage blocked */
  }
}

function syncUIStoreCount(items: CartLineItem[], pulse = false) {
  const total = items.reduce((s, i) => s + i.quantity, 0);
  useUIStore.setState((prev) => ({
    cartCount: total,
    cartPulse: pulse ? prev.cartPulse + 1 : prev.cartPulse,
  }));
}

interface CartStoreState {
  items: CartLineItem[];
  appliedPromo: AppliedPromoCode | null;
  isOpen: boolean;
  hasHydrated: boolean;

  hydrateCart: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addItem: (input: CartLineItemInput, openDrawer?: boolean) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  applyPromoCode: (promo: AppliedPromoCode) => void;
  removePromoCode: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: [],
  appliedPromo: null,
  isOpen: false,
  hasHydrated: false,

  hydrateCart: () => {
    if (typeof window === "undefined") return;
    let items: CartLineItem[] = [];
    let appliedPromo: AppliedPromoCode | null = null;
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          items?: CartLineItem[];
          appliedPromo?: AppliedPromoCode | null;
        };
        if (Array.isArray(parsed.items)) items = parsed.items;
        if (parsed.appliedPromo && typeof parsed.appliedPromo.code === "string") {
          appliedPromo = parsed.appliedPromo;
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    set({ items, appliedPromo, hasHydrated: true });
    syncUIStoreCount(items, false);
  },

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  addItem: (input, openDrawer = true) => {
    const lineKey = makeLineKey(input.productId, input.variantId);
    const addQty = Math.max(1, input.quantity ?? 1);
    const current = get().items;
    const existingIdx = current.findIndex((i) => i.lineKey === lineKey);

    let nextItems: CartLineItem[];
    if (existingIdx >= 0) {
      nextItems = current.map((item, idx) =>
        idx === existingIdx
          ? {
              ...item,
              unitPriceUsd: input.unitPriceUsd,
              maxStock: input.maxStock,
              quantity: Math.min(input.maxStock, item.quantity + addQty),
            }
          : item,
      );
    } else {
      const created: CartLineItem = {
        lineKey,
        productId: input.productId,
        slug: input.slug,
        sku: input.sku,
        title: input.title,
        image: input.image,
        categoryName: input.categoryName,
        unitPriceUsd: input.unitPriceUsd,
        variantId: input.variantId,
        variantName: input.variantName,
        colorHex: input.colorHex,
        maxStock: input.maxStock,
        quantity: Math.min(input.maxStock, addQty),
      };
      nextItems = [created, ...current];
    }

    persistCartState(nextItems, get().appliedPromo);
    syncUIStoreCount(nextItems, true);
    set({
      items: nextItems,
      ...(openDrawer ? { isOpen: true } : {}),
    });
  },

  removeItem: (lineKey) => {
    const nextItems = get().items.filter((i) => i.lineKey !== lineKey);
    persistCartState(nextItems, get().appliedPromo);
    syncUIStoreCount(nextItems, false);
    set({ items: nextItems });
  },

  updateQuantity: (lineKey, quantity) => {
    if (quantity <= 0) {
      get().removeItem(lineKey);
      return;
    }
    const nextItems = get().items.map((item) =>
      item.lineKey === lineKey
        ? { ...item, quantity: Math.min(item.maxStock, Math.max(1, quantity)) }
        : item,
    );
    persistCartState(nextItems, get().appliedPromo);
    syncUIStoreCount(nextItems, false);
    set({ items: nextItems });
  },

  applyPromoCode: (promo) => {
    persistCartState(get().items, promo);
    set({ appliedPromo: promo });
  },

  removePromoCode: () => {
    persistCartState(get().items, null);
    set({ appliedPromo: null });
  },

  clearCart: () => {
    persistCartState([], null);
    syncUIStoreCount([], false);
    set({ items: [], appliedPromo: null });
  },
}));
