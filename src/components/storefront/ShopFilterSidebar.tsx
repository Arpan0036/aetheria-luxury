"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { ARCHIVE_MATERIALS, matchesMaterialFilter } from "@/lib/catalog-query";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct, Category, CategorySlug, ProductSort } from "@/types/database";

export interface ShopFilterState {
  category: CategorySlug | "all";
  minPrice: number;
  maxPrice: number;
  material: string;
  inStock: boolean;
  bestseller: boolean;
  featured: boolean;
  newArrival: boolean;
  sort: ProductSort;
  q: string;
}

export const DEFAULT_SHOP_FILTERS: ShopFilterState = {
  category: "all",
  minPrice: 100,
  maxPrice: 1000,
  material: "",
  inStock: false,
  bestseller: false,
  featured: false,
  newArrival: false,
  sort: "featured",
  q: "",
};

export const SHOP_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Curated Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "top-rated", label: "Top Collector Rating" },
  { value: "sku", label: "SKU Reference" },
];

const CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

const PRICE_TIERS: { label: string; min: number; max: number }[] = [
  { label: "Under $250", min: 100, max: 250 },
  { label: "$250 – $450", min: 250, max: 450 },
  { label: "$450+", min: 450, max: 1000 },
];

interface FilterPanelContentProps {
  categories: (Category & { product_count: number })[];
  products: CatalogProduct[];
  filters: ShopFilterState;
  onUpdate: (patch: Partial<ShopFilterState>) => void;
  onReset: () => void;
}

function FilterPanelContent({
  categories,
  products,
  filters,
  onUpdate,
  onReset,
}: FilterPanelContentProps) {
  const currency = useUIStore((s) => s.activeCurrency);

  return (
    <div className="space-y-7">
      {/* 1. Architectural Category */}
      <div>
        <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
          <span>01 // ARCHITECTURAL DEPARTMENT</span>
          <span>{products.length} TOTAL</span>
        </div>
        <ul className="space-y-1.5" role="radiogroup" aria-label="Filter by architectural category">
          {[
            { slug: "all" as const, label: "All Objects", count: products.length },
            ...categories.map((c) => ({
              slug: c.slug,
              label: CATEGORY_SHORT_LABELS[c.slug] ?? c.name,
              count: c.product_count,
            })),
          ].map((item) => {
            const active = filters.category === item.slug;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onUpdate({ category: item.slug })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all",
                    active
                      ? "border-ink bg-ink text-canvas shadow-sm"
                      : "border-line bg-canvas text-ink hover:border-line-strong",
                  )}
                >
                  <span>{item.label}</span>
                  <span
                    className={cn(
                      "tabular rounded-full px-2 py-0.5 font-mono text-[10px]",
                      active ? "bg-canvas/15 text-canvas" : "bg-surface text-muted",
                    )}
                  >
                    {String(item.count).padStart(2, "0")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Price Range Slider & Quick Tiers */}
      <div className="border-t border-line pt-6">
        <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
          <span>02 // VALUATION CEILING</span>
          <span className="tabular text-ink">
            {formatPrice(filters.minPrice, currency)} – {formatPrice(filters.maxPrice, currency)}
          </span>
        </div>

        <label htmlFor="archive-max-price" className="sr-only">
          Maximum price in USD
        </label>
        <input
          id="archive-max-price"
          type="range"
          min={150}
          max={1000}
          step={25}
          value={filters.maxPrice}
          onChange={(e) => onUpdate({ maxPrice: Number(e.target.value) })}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-accent"
        />
        <div className="mt-1.5 flex justify-between font-mono text-[9.5px] text-muted">
          <span>{formatPrice(100, currency)}</span>
          <span>{formatPrice(500, currency)}</span>
          <span>{formatPrice(1000, currency)}</span>
        </div>

        {/* Quick-select Price Tiers */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {PRICE_TIERS.map((tier) => {
            const active = filters.minPrice === tier.min && filters.maxPrice === tier.max;
            return (
              <button
                key={tier.label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onUpdate(
                    active
                      ? { minPrice: 100, maxPrice: 1000 }
                      : { minPrice: tier.min, maxPrice: tier.max },
                  )
                }
                className={cn(
                  "rounded-xl border px-2 py-2 text-center font-mono text-[10px] tracking-wider transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-on"
                    : "border-line bg-canvas text-ink hover:border-line-strong",
                )}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Materials & Surface Finishes */}
      <div className="border-t border-line pt-6">
        <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
          <span>03 // MATERIALS &amp; FINISHES</span>
          {filters.material && (
            <button
              type="button"
              onClick={() => onUpdate({ material: "" })}
              className="text-accent underline underline-offset-4 hover:text-ink"
            >
              CLEAR
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by material finish">
          {ARCHIVE_MATERIALS.map((mat) => {
            const active = filters.material === mat.id;
            const count = products.filter((p) => matchesMaterialFilter(p, mat.id)).length;
            return (
              <button
                key={mat.id}
                type="button"
                aria-pressed={active}
                onClick={() => onUpdate({ material: active ? "" : mat.id })}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all",
                  active
                    ? "border-ink bg-ink text-canvas shadow-sm"
                    : "border-line bg-canvas text-ink hover:border-line-strong",
                )}
              >
                <span
                  aria-hidden
                  className="size-3 rounded-full border border-white/30"
                  style={{ backgroundColor: mat.hex }}
                />
                <span>{mat.label}</span>
                <span
                  className={cn(
                    "tabular font-mono text-[9.5px]",
                    active ? "text-canvas/75" : "text-muted",
                  )}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Archive Status Toggles */}
      <div className="border-t border-line pt-6">
        <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-muted">
          04 // ARCHIVE STATUS TOGGLES
        </p>
        <div className="space-y-2">
          {[
            { key: "inStock" as const, label: "In Stock Only", value: filters.inStock },
            { key: "bestseller" as const, label: "Bestsellers", value: filters.bestseller },
            { key: "featured" as const, label: "Featured Objects", value: filters.featured },
            { key: "newArrival" as const, label: "New Arrivals", value: filters.newArrival },
          ].map((toggle) => (
            <button
              key={toggle.key}
              type="button"
              role="switch"
              aria-checked={toggle.value}
              onClick={() => onUpdate({ [toggle.key]: !toggle.value })}
              className="flex w-full items-center justify-between rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-left text-[12.5px] font-medium text-ink transition-colors hover:border-line-strong"
            >
              <span>{toggle.label}</span>
              <span
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                  toggle.value ? "bg-accent" : "bg-line-strong",
                )}
              >
                <span
                  className={cn(
                    "size-4 rounded-full bg-canvas shadow-sm transition-transform",
                    toggle.value ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Sort Choreography */}
      <div className="border-t border-line pt-6">
        <label
          htmlFor="sidebar-sort-select"
          className="mb-2.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted"
        >
          <ArrowUpDown className="size-3" strokeWidth={1.75} />
          05 // SORT CHOREOGRAPHY
        </label>
        <select
          id="sidebar-sort-select"
          value={filters.sort}
          onChange={(e) => onUpdate({ sort: e.target.value as ProductSort })}
          className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[11.5px] tracking-wider text-ink outline-none transition-colors hover:border-ink focus:border-ink"
        >
          {SHOP_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <div className="border-t border-line pt-5">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line-strong bg-canvas font-mono text-[10.5px] tracking-[0.15em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
        >
          <RotateCcw className="size-3.5" strokeWidth={1.75} />
          RESET ARCHIVE FILTERS
        </button>
      </div>
    </div>
  );
}

export function ShopFilterSidebar({
  categories,
  products,
  filters,
  resultCount,
  onUpdate,
  onReset,
}: FilterPanelContentProps & { resultCount: number }) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (!mobileSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSheetOpen]);

  return (
    <>
      {/* Desktop Sticky Left Rail (>= 1024px) */}
      <aside
        aria-label="Archive filters"
        className="hidden lg:col-span-3 lg:block"
      >
        <div className="sticky top-28 rounded-[24px] border border-line bg-surface p-5 shadow-[0_24px_50px_-38px_rgb(var(--shadow-tint)/0.45)]">
          <FilterPanelContent
            categories={categories}
            products={products}
            filters={filters}
            onUpdate={onUpdate}
            onReset={onReset}
          />
        </div>
      </aside>

      {/* Mobile & Tablet (< 1024px) Floating Bottom Pill */}
      <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          aria-expanded={mobileSheetOpen}
          aria-controls="mobile-filter-sheet"
          className="glass inline-flex h-12 items-center gap-2.5 rounded-full border border-line-strong px-5 font-mono text-[11px] font-medium tracking-[0.16em] text-ink shadow-[0_20px_40px_-15px_rgb(var(--shadow-tint)/0.55)]"
        >
          <SlidersHorizontal className="size-3.5 text-accent" strokeWidth={1.75} />
          <span>[ FILTER &amp; SORT ARCHIVE • {resultCount} ]</span>
        </button>
      </div>

      {/* Mobile & Tablet Slide-Up 3D Bottom Sheet */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <motion.div
            key="mobile-filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMobileSheetOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#0D0C0B]/55 backdrop-blur-sm [perspective:1200px] lg:hidden"
          >
            <motion.div
              id="mobile-filter-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filter and sort archive"
              data-lenis-prevent
              initial={{ y: "100%", rotateX: 8 }}
              animate={{ y: 0, rotateX: 0 }}
              exit={{ y: "100%", rotateX: 6 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[86dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-[28px] border-t border-line-strong bg-surface shadow-[0_-30px_80px_-20px_rgb(var(--shadow-tint)/0.65)]"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
                    MULTI-FACET ARCHIVE ENGINE
                  </p>
                  <p className="font-display text-[26px] leading-none text-ink">
                    Filter &amp; Sort ({resultCount} Objects)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  aria-label="Close filter drawer"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-canvas text-ink"
                >
                  <X className="size-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanelContent
                  categories={categories}
                  products={products}
                  filters={filters}
                  onUpdate={onUpdate}
                  onReset={onReset}
                />
              </div>

              <div className="flex items-center gap-3 border-t border-line bg-canvas px-5 py-4">
                <button
                  type="button"
                  onClick={onReset}
                  className="h-12 rounded-full border border-line-strong px-5 font-mono text-[11px] tracking-wider text-ink"
                >
                  RESET
                </button>
                <MagneticButton
                  size="md"
                  variant="primary"
                  onClick={() => setMobileSheetOpen(false)}
                  className="flex-1"
                >
                  Apply Filters ({resultCount} Objects)
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
