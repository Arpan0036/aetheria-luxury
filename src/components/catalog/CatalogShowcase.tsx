"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUpDown, Check, Database, Heart, Plus, ShieldCheck, Star } from "lucide-react";
import { Tilt3DCard } from "@/components/motion/Tilt3DCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ProductPreview } from "./ProductPreview";
import { PromoCodeTester } from "./PromoCodeTester";
import { queryProducts } from "@/lib/catalog-query";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { buildWishlistItemFromProduct, useWishlistStore } from "@/store/useWishlistStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type {
  CatalogOverview,
  CatalogProduct,
  CategorySlug,
  ProductSort,
} from "@/types/database";

const CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "top-rated", label: "Top Rated" },
];

function ProductCatalogCard({ product, index }: { product: CatalogProduct; index: number }) {
  const currency = useUIStore((s) => s.activeCurrency);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlistItem = useWishlistStore((s) => s.toggleWishlistItem);
  const setQuickInspect = useUIStore((s) => s.setQuickInspectProduct);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const activeVariant = product.variants[selectedVariantIdx] ?? product.variants[0];
  const effectivePriceUsd = product.price_usd + (activeVariant?.price_modifier_usd ?? 0);
  const baseHex = activeVariant?.color_hex ?? product.three_d_config.base_hex;
  const primaryImage = product.images?.[0] ?? null;
  const isSaved = wishlistItems.some((w) => w.productId === product.id);

  const statusBadges: { text: string; cls: string }[] = [];
  if (product.is_featured) {
    statusBadges.push({ text: "FEATURED", cls: "border-line-strong text-ink" });
  }
  if (product.is_bestseller) {
    statusBadges.push({ text: "BESTSELLER", cls: "border-sage/45 text-sage" });
  }
  if (product.is_new_arrival) {
    statusBadges.push({ text: "NEW", cls: "border-accent/45 text-accent" });
  }
  if (statusBadges.length === 0) {
    statusBadges.push({ text: "EDITION", cls: "border-line text-muted" });
  }

  const handleAdd = () => {
    addItem(buildCartItemFromProduct(product, activeVariant), true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt3DCard className="group h-full">
        <article className="flex h-full flex-col p-3">
          {/* Studio Product Photo Container (aspect-[4/5] warm travertine #EFECE6) */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[#EFECE6]">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={`${product.title} — ${activeVariant?.variant_name ?? product.three_d_config.finish}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={index < 3 ? "eager" : "lazy"}
                {...(index === 0 ? { fetchPriority: "high" as const } : {})}
                className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
              />
            ) : (
              <ProductPreview
                shape={product.three_d_config.shape}
                base={baseHex}
                accent={product.three_d_config.accent_hex}
                metallic={product.three_d_config.metallic}
                label={`${product.title} — ${activeVariant?.variant_name ?? product.three_d_config.finish}`}
              />
            )}

            {/* Subtle bottom vignette for studio spec legibility */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141413]/55 via-[#141413]/15 to-transparent"
            />

            {/* Top-left glassmorphic status pills (FEATURED / BESTSELLER / NEW) */}
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1 [transform:translateZ(36px)]">
              {statusBadges.map((b) => (
                <span
                  key={b.text}
                  className={cn(
                    "glass rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-medium tracking-wider",
                    b.cls,
                  )}
                >
                  ● {b.text}
                </span>
              ))}
            </div>

            {/* Top-right category tag */}
            <span className="absolute right-3 top-3 rounded-full bg-[#141413]/85 px-2.5 py-1 font-mono text-[9.5px] tracking-wider text-[#F7F4EF] backdrop-blur-md [transform:translateZ(44px)]">
              {CATEGORY_SHORT_LABELS[product.category_slug].toUpperCase()}
            </span>

            {/* Bottom studio finish + Quick Inspect trigger */}
            <div className="absolute inset-x-3.5 bottom-3 z-20 flex items-center justify-between gap-2 font-mono text-[9.5px] tracking-wider text-[#F7F4EF]/90">
              <span className="truncate">{activeVariant?.variant_name.toUpperCase()}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickInspect(product);
                }}
                className="glass pointer-events-auto relative z-20 cursor-pointer rounded-full border border-line px-2.5 py-1 font-mono text-[9.5px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
              >
                Quick Inspect [+]
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
            {/* SKU + Rating */}
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.14em] text-muted">
              <span>{product.sku}</span>
              <span className="tabular inline-flex items-center gap-1 text-ink">
                <Star className="size-3 fill-accent text-accent" strokeWidth={1.5} />
                {product.rating.toFixed(2)}
                <span className="text-muted">({product.review_count})</span>
              </span>
            </div>

            {/* Title & Price */}
            <div className="mt-2 flex items-start justify-between gap-4">
              <h3 className="font-display text-[28px] leading-[1.06] text-ink">
                <Link
                  href={`/product/${product.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {product.title}
                </Link>
              </h3>
              <div className="shrink-0 text-right">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={`${currency}-${effectivePriceUsd}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="tabular font-mono text-[16.5px] font-medium text-ink"
                  >
                    {formatPrice(effectivePriceUsd, currency)}
                  </motion.p>
                </AnimatePresence>
                {product.compare_at_price_usd && (
                  <p className="tabular font-mono text-[10.5px] text-muted line-through">
                    {formatPrice(product.compare_at_price_usd, currency)}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{product.tagline}</p>

            {/* Interactive Variant Swatches + CTA */}
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 mt-5">
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label={`${product.title} finish`}>
                {product.variants.map((v, idx) => {
                  const selected = idx === selectedVariantIdx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${v.variant_name}${v.price_modifier_usd > 0 ? ` (+$${v.price_modifier_usd})` : ""}`}
                      title={v.variant_name}
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={cn(
                        "relative size-6 rounded-full border transition-transform",
                        selected ? "scale-110 border-ink ring-2 ring-ink/25" : "border-line-strong hover:scale-105",
                      )}
                      style={{ backgroundColor: v.color_hex }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-pressed={isSaved}
                  aria-label={`Save ${product.title} to wishlist`}
                  onClick={() =>
                    toggleWishlistItem(buildWishlistItemFromProduct(product, activeVariant))
                  }
                  className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong bg-canvas text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <Heart
                    className={cn("size-4", isSaved && "fill-accent text-accent")}
                    strokeWidth={1.75}
                  />
                </button>
                <MagneticButton
                  size="sm"
                  variant={added ? "surface" : "primary"}
                  onClick={handleAdd}
                  aria-label={`Add ${product.title} (${activeVariant?.variant_name ?? "default"}) to bag`}
                >
                  {added ? (
                    <>
                      <Check className="size-3.5" strokeWidth={2} /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" strokeWidth={2} /> Add to Bag
                    </>
                  )}
                </MagneticButton>
              </div>
            </div>
          </div>
        </article>
      </Tilt3DCard>
    </motion.li>
  );
}

export function CatalogShowcase({ overview }: { overview: CatalogOverview }) {
  const activeCategory = useUIStore((s) => s.catalogCategory);
  const setActiveCategory = useUIStore((s) => s.setCatalogCategory);
  const [sortBy, setSortBy] = useState<ProductSort>("featured");

  const visibleProducts = useMemo(
    () =>
      queryProducts(overview.products, {
        categorySlug: activeCategory,
        sortBy,
      }),
    [overview.products, activeCategory, sortBy],
  );

  const isLive = overview.status.mode === "supabase-live";
  const activeCategoryMeta =
    activeCategory === "all"
      ? null
      : overview.categories.find((c) => c.slug === activeCategory) ?? null;

  return (
    <section id="objects" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      {/* 1. Live Database Telemetry Status Bar */}
      <div className="mb-10 flex flex-col justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 font-mono text-[10.5px] tracking-[0.15em] sm:flex-row sm:items-center md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium",
              isLive
                ? "border-sage/45 bg-sage text-canvas"
                : "border-sage/40 bg-canvas text-sage",
            )}
          >
            <Database className="size-3" strokeWidth={1.75} />
            {isLive ? "LIVE SUPABASE POSTGRESQL" : "RESILIENT SEED FALLBACK ACTIVE"}
          </span>
          <span className="text-ink">
            12 OBJECTS // 4 ARCHITECTURAL CATEGORIES // RLS ENABLED
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <ShieldCheck className="size-3.5 text-sage" strokeWidth={1.75} />
          <span>16 STUDIO PHOTOS · 27 VARIANTS · 16 REVIEWS</span>
        </div>
      </div>

      {/* Section Heading */}
      <header className="mb-10 grid gap-6 border-t border-line pt-6 md:mb-12 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
            § 04 — THE FULL ARCHIVE // FILTER, SORT &amp; PROMO VALIDATOR
          </p>
          <h2 className="font-display text-[44px] text-ink sm:text-[60px] lg:text-[74px]">
            {activeCategoryMeta ? (
              <>
                {activeCategoryMeta.name.split(" ")[0]}{" "}
                <em className="text-accent">
                  {activeCategoryMeta.name.split(" ").slice(1).join(" ") || "Collection"}
                </em>
              </>
            ) : (
              <>
                Twelve <em className="text-accent">archival</em> objects.
              </>
            )}
          </h2>
        </div>
        <p className="max-w-[28rem] text-[14px] leading-relaxed text-muted">
          {activeCategoryMeta
            ? activeCategoryMeta.subtitle
            : "Photographed in our Warm Travertine Studio and served directly from live Supabase PostgreSQL records with real-time finish variants and multi-currency conversion."}
        </p>
      </header>

      {/* 3. Interactive Category Filter Pills & Sort Controls */}
      <div className="mb-10 flex flex-col justify-between gap-4 border-b border-line pb-6 lg:flex-row lg:items-center">
        <LayoutGroup id="category-pills">
          <div
            role="tablist"
            aria-label="Filter objects by category"
            className="flex flex-wrap items-center gap-2"
          >
            {[
              { slug: "all" as const, label: "All Objects", count: overview.products.length },
              ...overview.categories.map((c) => ({
                slug: c.slug,
                label: CATEGORY_SHORT_LABELS[c.slug],
                count: c.product_count,
              })),
            ].map((tab) => {
              const selected = activeCategory === tab.slug;
              return (
                <button
                  key={tab.slug}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveCategory(tab.slug)}
                  className={cn(
                    "relative inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors",
                    selected
                      ? "border-ink text-canvas"
                      : "border-line bg-surface/70 text-ink hover:border-line-strong",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="active-category-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-ink"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={cn(
                      "tabular relative z-10 font-mono text-[11px]",
                      selected ? "text-canvas/75" : "text-muted",
                    )}
                  >
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Sort selector */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.16em] text-muted">
            <ArrowUpDown className="size-3.5" strokeWidth={1.5} />
            SORT BY
          </span>
          <label htmlFor="catalog-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSort)}
            className="h-11 rounded-full border border-line-strong bg-surface px-4 font-mono text-[11.5px] tracking-wider text-ink outline-none transition-colors hover:border-ink focus:border-ink"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. 12-Product 3D Tilt Catalog Grid */}
      <motion.ul layout className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, i) => (
            <ProductCatalogCard key={product.id} product={product} index={i} />
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* 5. Live Promo Code Validator Widget */}
      <PromoCodeTester />
    </section>
  );
}
