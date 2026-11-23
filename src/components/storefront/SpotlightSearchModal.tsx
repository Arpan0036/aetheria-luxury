"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, CornerDownLeft, Eye, Plus, Search, Sparkles, X } from "lucide-react";
import { queryProducts } from "@/lib/catalog-query";
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_VARIANTS } from "@/lib/supabase/fallback-data";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct, CategorySlug } from "@/types/database";

const CATEGORY_SHORTCUTS: { slug: CategorySlug; label: string; count: number }[] = [
  { slug: "spatial-audio", label: "Spatial Audio", count: 3 },
  { slug: "desk-architecture", label: "Desk Architecture", count: 4 },
  { slug: "tactile-computing", label: "Tactile Computing", count: 3 },
  { slug: "ambient-lighting", label: "Ambient Lighting", count: 2 },
];

const TRENDING_SEARCHES = [
  "Travertine",
  "Headphones",
  "Mechanical Keyboard",
  "Brass Lamp",
] as const;

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

const FALLBACK_CATALOG: CatalogProduct[] = SEED_PRODUCTS.map((p) => {
  const cat = SEED_CATEGORIES.find((c) => c.id === p.category_id);
  return {
    ...p,
    category_slug: (cat?.slug ?? "spatial-audio") as CategorySlug,
    variants: SEED_VARIANTS.filter((v) => v.product_id === p.id),
  };
});

export function SpotlightSearchModal({ products }: { products?: CatalogProduct[] }) {
  const router = useRouter();
  const isOpen = useUIStore((s) => s.isSearchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const currency = useUIStore((s) => s.activeCurrency);
  const addItem = useCartStore((s) => s.addItem);

  const catalog = products && products.length > 0 ? products : FALLBACK_CATALOG;

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return queryProducts(catalog, { searchQuery: query, sortBy: "featured" });
  }, [catalog, isSearching, query]);

  const flagshipObjects = useMemo(
    () =>
      [...catalog]
        .filter((p) => p.is_featured || p.is_bestseller)
        .slice(0, 3),
    [catalog],
  );

  const navigableProducts = isSearching ? searchResults : flagshipObjects;
  const clampedActiveIndex =
    navigableProducts.length > 0 ? Math.min(activeIndex, navigableProducts.length - 1) : 0;

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (!navigableProducts.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % navigableProducts.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + navigableProducts.length) % navigableProducts.length);
      } else if (e.key === "Enter" && document.activeElement === inputRef.current) {
        e.preventDefault();
        const target = navigableProducts[clampedActiveIndex];
        if (target) {
          setOpen(false);
          router.push(`/product/${target.slug}`);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, navigableProducts, clampedActiveIndex, router, setOpen]);

  const handleQuickAdd = (product: CatalogProduct) => {
    addItem(buildCartItemFromProduct(product), true);
    setAddedSku(product.sku);
    setOpen(false);
  };

  const handleInspect = (product: CatalogProduct) => {
    setOpen(false);
    router.push(`/product/${product.slug}`);
  };

  const handleCategoryShortcut = (slug: CategorySlug) => {
    setOpen(false);
    router.push(`/shop?category=${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="spotlight-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0D0C0B]/55 px-4 pb-10 pt-[8vh] backdrop-blur-md [perspective:1400px] sm:pt-[11vh]"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Spotlight Archive Search"
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.95, rotateX: 5, y: -16 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[780px] overflow-hidden rounded-[26px] border border-line-strong bg-canvas shadow-[0_50px_140px_-40px_rgb(var(--shadow-tint)/0.65)]"
          >
            {/* Search Input Header */}
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-3 border-b border-line bg-surface/65 px-5 py-4"
            >
              <Search className="size-5 shrink-0 text-accent" strokeWidth={1.75} />
              <label htmlFor="spotlight-search-input" className="sr-only">
                Search archive by title, SKU, material, or department
              </label>
              <input
                ref={inputRef}
                id="spotlight-search-input"
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search objects, SKUs, travertine, beryllium, lamps…"
                className="h-9 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search query"
                  className="inline-flex size-7 items-center justify-center rounded-full border border-line bg-canvas text-muted hover:text-ink"
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line bg-canvas px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted transition-colors hover:border-ink hover:text-ink"
              >
                ESC
              </button>
            </form>

            {/* Body */}
            <div className="max-h-[68dvh] overflow-y-auto p-5">
              {!isSearching ? (
                /* Quick Discovery State (When Input is Empty) */
                <div className="space-y-6">
                  {/* 1. Quick Category Shortcuts */}
                  <div>
                    <p className="mb-2.5 font-mono text-[10px] tracking-[0.18em] text-muted">
                      01 // QUICK DEPARTMENT SHORTCUTS
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {CATEGORY_SHORTCUTS.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => handleCategoryShortcut(cat.slug)}
                          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3 text-left transition-all hover:border-ink hover:bg-ink hover:text-canvas"
                        >
                          <span className="font-mono text-[9.5px] tracking-wider text-muted group-hover:text-canvas/70">
                            0{cat.count} OBJECTS
                          </span>
                          <span className="mt-2 flex items-center justify-between gap-1 text-[13px] font-medium">
                            {cat.label}
                            <ArrowRight
                              className="size-3.5 transition-transform group-hover:translate-x-0.5"
                              strokeWidth={1.75}
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Trending Searches */}
                  <div>
                    <p className="mb-2.5 font-mono text-[10px] tracking-[0.18em] text-muted">
                      02 // TRENDING ARCHIVE QUERIES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            setActiveIndex(0);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-accent hover:bg-accent hover:text-accent-on"
                        >
                          <Sparkles className="size-3" strokeWidth={1.75} />
                          “{term}”
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Top 3 Flagship Objects */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
                      <span>03 // TOP 3 FLAGSHIP OBJECTS (LIVE SUPABASE)</span>
                      <Link
                        href="/shop"
                        onClick={() => setOpen(false)}
                        className="text-accent underline underline-offset-4 hover:text-ink"
                      >
                        OPEN FULL /SHOP ARCHIVE →
                      </Link>
                    </div>
                    <ul className="space-y-2" role="listbox" aria-label="Flagship objects">
                      {flagshipObjects.map((product, idx) => {
                        const active = idx === clampedActiveIndex;
                        const isAdded = addedSku === product.sku;
                        return (
                          <li
                            key={product.id}
                            role="option"
                            aria-selected={active}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-2xl border p-2.5 transition-colors",
                              active
                                ? "border-line-strong bg-surface"
                                : "border-transparent bg-surface/45 hover:bg-surface",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => handleInspect(product)}
                              className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                            >
                              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-[#EFECE6]">
                                {product.images?.[0] && (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.title}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 font-mono text-[9.5px] tracking-wider text-muted">
                                  <span className="rounded bg-canvas px-1.5 py-0.5 text-ink">
                                    {product.sku}
                                  </span>
                                  <span>{CATEGORY_LABELS[product.category_slug].toUpperCase()}</span>
                                </div>
                                <p className="mt-1 truncate font-display text-[22px] leading-none text-ink">
                                  {product.title}
                                </p>
                              </div>
                            </button>

                            <div className="flex shrink-0 items-center gap-2">
                              <span className="tabular hidden font-mono text-[13.5px] font-medium text-ink sm:inline">
                                {formatPrice(product.price_usd, currency)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuickAdd(product)}
                                aria-label={`Add ${product.title} to bag`}
                                className={cn(
                                  "inline-flex h-9 items-center gap-1 rounded-full border px-3 font-mono text-[10.5px] font-medium transition-colors",
                                  isAdded
                                    ? "border-sage bg-sage text-canvas"
                                    : "border-line-strong bg-canvas text-ink hover:border-ink hover:bg-ink hover:text-canvas",
                                )}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="size-3" strokeWidth={2} /> Added
                                  </>
                                ) : (
                                  <>
                                    Add to Bag <Plus className="size-3" strokeWidth={2} />
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInspect(product)}
                                aria-label={`Inspect ${product.title}`}
                                className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-canvas text-ink transition-colors hover:border-accent hover:text-accent"
                              >
                                <Eye className="size-3.5" strokeWidth={1.75} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                /* Interactive Live Search Results List */
                <div>
                  <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
                    <span>
                      {searchResults.length} LIVE SUPABASE{" "}
                      {searchResults.length === 1 ? "RESULT" : "RESULTS"} FOR “{query.toUpperCase()}”
                    </span>
                    <Link
                      href={`/shop?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => setOpen(false)}
                      className="text-accent underline underline-offset-4 hover:text-ink"
                    >
                      VIEW IN /SHOP ARCHIVE →
                    </Link>
                  </div>

                  {searchResults.length > 0 ? (
                    <ul className="space-y-2" role="listbox" aria-label="Search results">
                      {searchResults.map((product, idx) => {
                        const active = idx === clampedActiveIndex;
                        const isAdded = addedSku === product.sku;
                        return (
                          <li
                            key={product.id}
                            role="option"
                            aria-selected={active}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-2xl border p-2.5 transition-colors",
                              active
                                ? "border-ink bg-surface shadow-sm"
                                : "border-line bg-surface/50 hover:bg-surface",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => handleInspect(product)}
                              className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                            >
                              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-[#EFECE6]">
                                {product.images?.[0] && (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.title}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 font-mono text-[9.5px] tracking-wider text-muted">
                                  <span className="rounded bg-canvas px-1.5 py-0.5 text-ink">
                                    {product.sku}
                                  </span>
                                  <span>{CATEGORY_LABELS[product.category_slug].toUpperCase()}</span>
                                  <span className="hidden text-sage sm:inline">
                                    ● {product.stock_count} IN STOCK
                                  </span>
                                </div>
                                <p className="mt-1 truncate font-display text-[22px] leading-none text-ink">
                                  {product.title}
                                </p>
                                <p className="mt-0.5 truncate text-[12px] text-muted">
                                  {product.tagline}
                                </p>
                              </div>
                            </button>

                            <div className="flex shrink-0 items-center gap-2">
                              <span className="tabular font-mono text-[14px] font-medium text-ink">
                                {formatPrice(product.price_usd, currency)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuickAdd(product)}
                                aria-label={`Add ${product.title} to bag`}
                                className={cn(
                                  "inline-flex h-9 items-center gap-1 rounded-full border px-3 font-mono text-[10.5px] font-medium transition-colors",
                                  isAdded
                                    ? "border-sage bg-sage text-canvas"
                                    : "border-line-strong bg-canvas text-ink hover:border-ink hover:bg-ink hover:text-canvas",
                                )}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="size-3" strokeWidth={2} /> Added
                                  </>
                                ) : (
                                  <>
                                    Add to Bag <Plus className="size-3" strokeWidth={2} />
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInspect(product)}
                                aria-label={`Inspect ${product.title}`}
                                className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-canvas px-3 font-mono text-[10px] text-ink transition-colors hover:border-accent hover:text-accent"
                              >
                                Inspect <ArrowRight className="size-3" strokeWidth={1.75} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                      <p className="font-display text-[28px] text-ink">
                        No objects match “{query}”.
                      </p>
                      <p className="mt-1 text-[13px] text-muted">
                        Try searching for a material like “Travertine”, “Beryllium”, or browse all 12 objects in the archive.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {TRENDING_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[10.5px] text-ink hover:border-ink"
                          >
                            Try “{term}”
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Keyboard Hint Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-muted">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 text-ink">↑</kbd>
                  <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 text-ink">↓</kbd>
                  NAVIGATE
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="inline-flex items-center rounded border border-line bg-canvas px-1.5 py-0.5 text-ink">
                    <CornerDownLeft className="size-2.5" />
                  </kbd>
                  QUICK INSPECT
                </span>
              </div>
              <span>LIVE SUPABASE SPOTLIGHT // {catalog.length} OBJECTS INDEXED</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
