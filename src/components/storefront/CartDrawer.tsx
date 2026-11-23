"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plane,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { validateDiscountAction } from "@/app/actions/discount";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_VARIANTS } from "@/lib/supabase/fallback-data";
import {
  buildCartItemFromProduct,
  computeCartFinancials,
  useCartStore,
  type CartLineItem,
} from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct, CategorySlug } from "@/types/database";

const QUICK_PROMO_PILLS = [
  { code: "AETHERIA15", label: "AETHERIA15 • 15% OFF $100+" },
  { code: "TIER1VIP", label: "TIER1VIP • 20% OFF $300+" },
  { code: "FREESHIP", label: "FREESHIP • 10% OFF" },
] as const;

const QUICK_DEPARTMENTS: { slug: CategorySlug; label: string }[] = [
  { slug: "spatial-audio", label: "Spatial Audio" },
  { slug: "desk-architecture", label: "Desk Architecture" },
  { slug: "tactile-computing", label: "Tactile Computing" },
  { slug: "ambient-lighting", label: "Ambient Lighting" },
];

const FALLBACK_CATALOG: CatalogProduct[] = SEED_PRODUCTS.map((p) => {
  const cat = SEED_CATEGORIES.find((c) => c.id === p.category_id);
  return {
    ...p,
    category_slug: (cat?.slug ?? "spatial-audio") as CategorySlug,
    variants: SEED_VARIANTS.filter((v) => v.product_id === p.id),
  };
});

export function CartDrawer({ products }: { products?: CatalogProduct[] }) {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);
  const clearCart = useCartStore((s) => s.clearCart);

  const toggleWishlistItem = useWishlistStore((s) => s.toggleWishlistItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const currency = useUIStore((s) => s.activeCurrency);

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, startPromoTransition] = useTransition();

  const catalog = products && products.length > 0 ? products : FALLBACK_CATALOG;
  const financials = useMemo(
    () => computeCartFinancials(items, appliedPromo),
    [items, appliedPromo],
  );

  // Dynamic cross-sell recommendations from live Supabase products (filtering out items already in cart)
  const crossSellProducts = useMemo(() => {
    const inCartIds = new Set(items.map((i) => i.productId));
    return catalog.filter((p) => !inCartIds.has(p.id)).slice(0, 3);
  }, [catalog, items]);

  const emptyStateFlagships = useMemo(
    () => catalog.filter((p) => p.is_featured || p.is_bestseller).slice(0, 2),
    [catalog],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setOpen]);

  const executePromoValidation = (rawCode: string) => {
    const clean = rawCode.trim().toUpperCase();
    setPromoInput(clean);
    setPromoError(null);
    if (!clean) {
      setPromoError("ENTER A COLLECTOR CODE TO VALIDATE.");
      return;
    }

    startPromoTransition(async () => {
      const result = await validateDiscountAction(clean, financials.subtotalUsd);
      if (result.valid) {
        applyPromoCode({
          code: result.code,
          description: result.description,
          discount_percent: result.discount_percent,
          min_order_usd: result.min_order_usd,
          mode: result.mode,
        });
        setPromoError(null);
      } else {
        if (result.reason === "below-minimum" && result.min_order_usd) {
          const diff = Math.max(0, result.min_order_usd - financials.subtotalUsd);
          setPromoError(
            `ADD ${formatPrice(diff, currency)} MORE TO UNLOCK ${clean} (MIN ${formatPrice(
              result.min_order_usd,
              currency,
            )})`,
          );
        } else {
          setPromoError(result.message.toUpperCase());
        }
      }
    });
  };

  const handlePromoSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executePromoValidation(promoInput);
  };

  const handleSaveForLater = (line: CartLineItem) => {
    const alreadySaved = wishlistItems.some((w) => w.productId === line.productId);
    if (!alreadySaved) {
      toggleWishlistItem({
        productId: line.productId,
        slug: line.slug,
        sku: line.sku,
        title: line.title,
        image: line.image,
        priceUsd: line.unitPriceUsd,
        tagline: `${line.variantName} · ${line.categoryName}`,
        categoryName: line.categoryName,
        defaultVariant: {
          id: line.variantId,
          sku: line.sku,
          variant_name: line.variantName,
          color_hex: line.colorHex,
          price_modifier_usd: 0,
          stock_count: line.maxStock,
        },
      });
    }
    removeItem(line.lineKey);
  };

  const countLabel = String(financials.totalItemsCount).padStart(2, "0");
  const freeShippingUnlocked = financials.subtotalUsd >= 150 && items.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cart-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex justify-end bg-[#0D0C0B]/55 backdrop-blur-md [perspective:1400px]"
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Collector Bag Drawer"
            data-lenis-prevent
            initial={{ x: "100%", rotateY: -6 }}
            animate={{ x: 0, rotateY: 0 }}
            exit={{ x: "100%", rotateY: -4 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex h-dvh w-full max-w-[480px] flex-col border-l border-line-strong bg-canvas shadow-[-40px_0_100px_-30px_rgb(var(--shadow-tint)/0.65)]"
          >
            {/* 2.1 Drawer Header & Tier-1 Free Shipping Telemetry Bar */}
            <header className="border-b border-line px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted">
                    COLLECTOR BAG {"//"} [{countLabel} {financials.totalItemsCount === 1 ? "OBJECT" : "OBJECTS"}]
                  </p>
                  <h2 className="mt-1 font-display text-[32px] leading-none text-ink">
                    Your <em className="text-accent">Sanctuary</em> Bag
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="rounded-full border border-line px-3 py-1.5 font-mono text-[9.5px] tracking-wider text-muted transition-colors hover:border-ink hover:text-ink"
                    >
                      Clear Archive
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close collector bag"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 font-mono text-[10px] tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                  >
                    <span>ESC</span>
                    <X className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {/* Interactive Free Express Shipping Progress Bar */}
              <div className="mt-4 rounded-2xl border border-line bg-surface p-3.5">
                <div className="flex items-center justify-between gap-2 font-mono text-[9.5px] tracking-[0.14em]">
                  {freeShippingUnlocked ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-sage">
                      <Check className="size-3.5" strokeWidth={2.2} />
                      ✓ COMPLIMENTARY INSURED EXPRESS AIR DISPATCH UNLOCKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-ink">
                      <Plane className="size-3.5 text-accent" strokeWidth={1.75} />
                      ADD{" "}
                      <strong className="tabular font-medium text-accent">
                        {formatPrice(financials.freeShippingRemainingUsd, currency)}
                      </strong>{" "}
                      MORE FOR COMPLIMENTARY INSURED AIR DISPATCH (US / UK / EU)
                    </span>
                  )}
                  <span className="tabular shrink-0 text-muted">
                    {financials.freeShippingProgressPercent}%
                  </span>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    initial={false}
                    animate={{ width: `${financials.freeShippingProgressPercent}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 26 }}
                    className={cn(
                      "h-full rounded-full transition-colors duration-300",
                      freeShippingUnlocked ? "bg-sage" : "bg-accent",
                    )}
                  />
                </div>
              </div>
            </header>

            {/* Scrollable Middle: Line Items + Promo Engine + Cross-Sell OR Empty State */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {items.length === 0 ? (
                /* 2.2 Architectural Empty Bag State */
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div className="rounded-[24px] border border-line bg-surface p-6 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-line-strong bg-canvas text-accent">
                      <ShoppingBag className="size-6" strokeWidth={1.5} />
                    </div>
                    <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-muted">
                      ARCHIVE BAG EMPTY // 00 OBJECTS
                    </p>
                    <h3 className="mt-1.5 font-display text-[30px] leading-tight text-ink">
                      Begin Your Collection
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                      Explore our four architectural departments or add a flagship studio instrument
                      below in one click.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                      {QUICK_DEPARTMENTS.map((dept) => (
                        <Link
                          key={dept.slug}
                          href={`/shop?category=${dept.slug}`}
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[10px] tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                        >
                          {dept.label} →
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* 2 Flagship "One-Click Add" Objects */}
                  <div>
                    <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-muted">
                      FLAGSHIP ONE-CLICK TEST OBJECTS (LIVE SUPABASE)
                    </p>
                    <ul className="space-y-2.5">
                      {emptyStateFlagships.map((prod) => (
                        <li
                          key={prod.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-[#EFECE6]">
                              {prod.images?.[0] && (
                                <Image
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono text-[9.5px] tracking-wider text-muted">
                                {prod.sku}
                              </p>
                              <p className="truncate font-display text-[20px] leading-tight text-ink">
                                {prod.title}
                              </p>
                              <p className="tabular font-mono text-[12px] text-ink">
                                {formatPrice(prod.price_usd, currency)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => addItem(buildCartItemFromProduct(prod), true)}
                            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-ink px-3.5 font-mono text-[10px] font-medium tracking-wider text-canvas transition-colors hover:bg-accent hover:text-accent-on"
                          >
                            <Plus className="size-3" strokeWidth={2} /> One-Click Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 2.2 Cart Line Item Cards */}
                  <ul className="space-y-3" aria-label="Cart line items">
                    <AnimatePresence initial={false}>
                      {items.map((line) => {
                        const lineTotalUsd = line.unitPriceUsd * line.quantity;
                        const atMaxStock = line.quantity >= line.maxStock;
                        return (
                          <motion.li
                            key={line.lineKey}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="rounded-[22px] border border-line bg-surface p-3.5"
                          >
                            <div className="flex gap-3.5">
                              {/* Studio thumbnail (aspect-[4/5]) linking to /product/[slug] */}
                              <Link
                                href={`/product/${line.slug}`}
                                onClick={() => setOpen(false)}
                                className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-[#EFECE6]"
                              >
                                <Image
                                  src={line.image}
                                  alt={`${line.title} — ${line.variantName}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </Link>

                              {/* Line Item Details */}
                              <div className="flex min-w-0 flex-1 flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-[9.5px] tracking-[0.14em] text-muted">
                                      {line.sku}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(line.lineKey)}
                                      aria-label={`Remove ${line.title} (${line.variantName})`}
                                      className="inline-flex items-center gap-1 font-mono text-[9.5px] tracking-wider text-muted transition-colors hover:text-accent"
                                    >
                                      Remove ×
                                    </button>
                                  </div>

                                  <Link
                                    href={`/product/${line.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="mt-0.5 block font-display text-[22px] leading-[1.05] text-ink transition-colors hover:text-accent"
                                  >
                                    {line.title}
                                  </Link>

                                  {/* Selected Variant Swatch + Finish Label */}
                                  <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-ink">
                                    <span
                                      aria-hidden
                                      className="size-2.5 rounded-full border border-white/40"
                                      style={{ backgroundColor: line.colorHex }}
                                    />
                                    <span>● {line.variantName}</span>
                                  </div>
                                </div>

                                {/* Quantity Stepper + Save for Later + Animated Line Total */}
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="inline-flex h-8 items-center rounded-full border border-line-strong bg-canvas px-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateQuantity(line.lineKey, line.quantity - 1)
                                        }
                                        aria-label={`Decrease quantity for ${line.title}`}
                                        className="inline-flex size-6 items-center justify-center rounded-full text-ink hover:bg-surface"
                                      >
                                        <Minus className="size-3" strokeWidth={1.75} />
                                      </button>
                                      <span className="tabular min-w-7 text-center font-mono text-[11.5px] font-medium text-ink">
                                        {line.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={atMaxStock}
                                        onClick={() =>
                                          updateQuantity(line.lineKey, line.quantity + 1)
                                        }
                                        aria-label={`Increase quantity for ${line.title}`}
                                        className="inline-flex size-6 items-center justify-center rounded-full text-ink hover:bg-surface disabled:opacity-35"
                                      >
                                        <Plus className="size-3" strokeWidth={1.75} />
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleSaveForLater(line)}
                                      className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[9px] tracking-wider text-muted transition-colors hover:border-ink hover:text-ink"
                                    >
                                      <Heart className="size-2.5" strokeWidth={1.75} />
                                      Save for Later ♡
                                    </button>
                                  </div>

                                  <p className="tabular font-mono text-[14.5px] font-medium text-ink">
                                    {formatPrice(lineTotalUsd, currency)}
                                  </p>
                                </div>

                                {atMaxStock && (
                                  <p className="mt-1 font-mono text-[9px] tracking-wider text-accent">
                                    MAX ARCHIVE ALLOCATION ({line.maxStock} UNITS)
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>

                  {/* 2.3 Live Supabase Promo Code Engine */}
                  <div className="rounded-[22px] border border-line bg-surface p-4">
                    <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-muted">
                      <span className="inline-flex items-center gap-1.5 text-ink">
                        <Tag className="size-3 text-accent" strokeWidth={1.75} />
                        COLLECTOR PRIVILEGE / PROMO CODE
                      </span>
                      <span>LIVE SUPABASE</span>
                    </div>

                    <form onSubmit={handlePromoSubmit} className="flex gap-2">
                      <label htmlFor="cart-promo-input" className="sr-only">
                        Promo code
                      </label>
                      <input
                        id="cart-promo-input"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Enter AETHERIA15, TIER1VIP, FREESHIP…"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[11.5px] tracking-wider text-ink uppercase outline-none transition-colors focus:border-ink"
                      />
                      <button
                        type="submit"
                        disabled={isValidatingPromo}
                        className="h-10 shrink-0 rounded-xl bg-ink px-4 font-mono text-[10.5px] font-medium tracking-[0.14em] text-canvas transition-colors hover:bg-accent hover:text-accent-on disabled:opacity-50"
                      >
                        {isValidatingPromo ? "CHECKING…" : "[ APPLY ]"}
                      </button>
                    </form>

                    {/* 1-Click Quick-Test Promo Pills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {QUICK_PROMO_PILLS.map((pill) => {
                        const isCurrent = appliedPromo?.code === pill.code;
                        return (
                          <button
                            key={pill.code}
                            type="button"
                            onClick={() => executePromoValidation(pill.code)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-wider transition-colors",
                              isCurrent
                                ? "border-sage bg-sage text-canvas"
                                : "border-line-strong bg-canvas text-ink hover:border-ink",
                            )}
                          >
                            [{pill.label}]
                          </button>
                        );
                      })}
                    </div>

                    {/* Live Validation Feedback */}
                    {promoError && (
                      <p
                        role="alert"
                        className="mt-2.5 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-[10px] tracking-wider text-accent"
                      >
                        {promoError}
                      </p>
                    )}

                    {appliedPromo && financials.promoBelowMinimumUsd > 0 && (
                      <div
                        role="status"
                        className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-[10px] tracking-wider text-accent"
                      >
                        <span>
                          ADD {formatPrice(financials.promoBelowMinimumUsd, currency)} MORE TO
                          UNLOCK {appliedPromo.code} ({appliedPromo.discount_percent}% OFF)
                        </span>
                        <button
                          type="button"
                          onClick={removePromoCode}
                          className="underline underline-offset-2"
                        >
                          [REMOVE ×]
                        </button>
                      </div>
                    )}

                    {appliedPromo && financials.discountAmountUsd > 0 && (
                      <div
                        role="status"
                        className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-sage/45 bg-sage/10 px-3 py-2 font-mono text-[10px] tracking-wider text-sage"
                      >
                        <span>
                          ✓ {appliedPromo.code} APPLIED ({appliedPromo.discount_percent}% OFF) —
                          SAVING {formatPrice(financials.discountAmountUsd, currency)}
                        </span>
                        <button
                          type="button"
                          onClick={removePromoCode}
                          className="font-medium text-ink hover:text-accent"
                        >
                          [REMOVE ×]
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2.4 In-Drawer "Complete the Sanctuary" Cross-Sell Strip */}
                  {crossSellProducts.length > 0 && (
                    <div>
                      <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Sparkles className="size-3 text-accent" strokeWidth={1.75} />
                          COMPLETE THE SANCTUARY
                        </span>
                        <span>LIVE RECOMMENDATIONS</span>
                      </div>

                      <ul className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                        {crossSellProducts.map((prod) => (
                          <li
                            key={prod.id}
                            className="flex w-[225px] shrink-0 items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5"
                          >
                            <Link
                              href={`/product/${prod.slug}`}
                              onClick={() => setOpen(false)}
                              className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-[#EFECE6]"
                            >
                              {prod.images?.[0] && (
                                <Image
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              )}
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/product/${prod.slug}`}
                                onClick={() => setOpen(false)}
                                className="block truncate font-display text-[17px] leading-tight text-ink hover:text-accent"
                              >
                                {prod.title}
                              </Link>
                              <div className="mt-1 flex items-center justify-between gap-1">
                                <span className="tabular font-mono text-[10.5px] text-muted">
                                  {formatPrice(prod.price_usd, currency)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addItem(buildCartItemFromProduct(prod), true)}
                                  className="rounded-full bg-ink px-2.5 py-0.5 font-mono text-[9.5px] font-medium text-canvas transition-colors hover:bg-accent hover:text-accent-on"
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2.5 Sticky Conversion Footer */}
            {items.length > 0 && (
              <footer className="border-t border-line-strong bg-surface px-5 py-4 sm:px-6">
                <dl className="space-y-1.5 font-mono text-[11px] tracking-[0.14em]">
                  <div className="flex items-center justify-between text-muted">
                    <dt>ARCHIVE SUBTOTAL</dt>
                    <dd className="tabular text-ink">
                      {formatPrice(financials.subtotalUsd, currency)}
                    </dd>
                  </div>

                  {appliedPromo && financials.discountAmountUsd > 0 && (
                    <div className="flex items-center justify-between text-sage">
                      <dt>PRIVILEGE DISCOUNT ({appliedPromo.code})</dt>
                      <dd className="tabular">
                        −{formatPrice(financials.discountAmountUsd, currency)}
                      </dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-muted">
                    <dt>INSURED AIR DISPATCH</dt>
                    <dd className="tabular text-ink">
                      {financials.shippingUsd === 0 ? (
                        <span className="text-sage">COMPLIMENTARY</span>
                      ) : (
                        formatPrice(financials.shippingUsd, currency)
                      )}
                    </dd>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-line pt-2.5">
                    <div>
                      <dt className="text-[11.5px] font-medium text-ink">ESTIMATED TOTAL</dt>
                      <dd className="text-[9.5px] tracking-wider text-muted">
                        Duties &amp; VAT Included (DDP)
                      </dd>
                    </div>
                    <dd className="tabular font-mono text-[22px] font-medium text-ink">
                      {formatPrice(financials.grandTotalUsd, currency)}
                    </dd>
                  </div>
                </dl>

                <MagneticButton
                  size="lg"
                  variant="primary"
                  onClick={() => {
                    setOpen(false);
                    router.push("/checkout");
                  }}
                  className="mt-4 w-full"
                >
                  Proceed to Private Checkout <ArrowRight className="size-4" strokeWidth={1.75} />
                </MagneticButton>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
