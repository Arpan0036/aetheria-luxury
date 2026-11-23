"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Check,
  Database,
  Grid2x2,
  Heart,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { Tilt3DCard } from "@/components/motion/Tilt3DCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import {
  DEFAULT_SHOP_FILTERS,
  ShopFilterSidebar,
  type ShopFilterState,
} from "./ShopFilterSidebar";
import { ARCHIVE_MATERIALS, queryProducts } from "@/lib/catalog-query";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { buildWishlistItemFromProduct, useWishlistStore } from "@/store/useWishlistStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type {
  ArchiveLayoutMode,
  CatalogOverview,
  CatalogProduct,
  CategorySlug,
  ProductSort,
} from "@/types/database";

const VALID_CATEGORIES = new Set<CategorySlug>([
  "spatial-audio",
  "desk-architecture",
  "tactile-computing",
  "ambient-lighting",
]);

const VALID_SORTS = new Set<ProductSort>([
  "featured",
  "price-asc",
  "price-desc",
  "top-rated",
  "sku",
]);

const CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

const LAYOUT_MODES: { id: ArchiveLayoutMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: "grid-3", label: "[ 3-COL SPATIAL GRID ]", icon: LayoutGrid },
  { id: "gallery-2", label: "[ 2-COL EDITORIAL GALLERY ]", icon: Grid2x2 },
  { id: "ledger", label: "[ TECHNICAL LEDGER VIEW ]", icon: List },
];

function parseSearchParams(sp: URLSearchParams): ShopFilterState {
  const rawCat = sp.get("category");
  const category: CategorySlug | "all" =
    rawCat && VALID_CATEGORIES.has(rawCat as CategorySlug)
      ? (rawCat as CategorySlug)
      : "all";

  const minRaw = Number(sp.get("minPrice"));
  const maxRaw = Number(sp.get("maxPrice"));
  const minPrice = Number.isFinite(minRaw) && minRaw >= 100 ? minRaw : DEFAULT_SHOP_FILTERS.minPrice;
  const maxPrice =
    Number.isFinite(maxRaw) && maxRaw >= 150 && maxRaw <= 1000
      ? maxRaw
      : DEFAULT_SHOP_FILTERS.maxPrice;

  const material = sp.get("material") ?? sp.get("finish") ?? "";
  const inStock = sp.get("inStock") === "true" || sp.get("inStock") === "1";
  const bestseller = sp.get("bestseller") === "true" || sp.get("bestseller") === "1";
  const featured = sp.get("featured") === "true" || sp.get("featured") === "1";
  const newArrival = sp.get("newArrival") === "true" || sp.get("newArrival") === "1";

  const rawSort = sp.get("sort");
  const sort: ProductSort =
    rawSort && VALID_SORTS.has(rawSort as ProductSort)
      ? (rawSort as ProductSort)
      : DEFAULT_SHOP_FILTERS.sort;

  const q = sp.get("q") ?? "";

  return {
    category,
    minPrice,
    maxPrice,
    material,
    inStock,
    bestseller,
    featured,
    newArrival,
    sort,
    q,
  };
}

function buildSearchString(state: ShopFilterState): string {
  const params = new URLSearchParams();
  if (state.category !== "all") params.set("category", state.category);
  if (state.minPrice > DEFAULT_SHOP_FILTERS.minPrice) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice < DEFAULT_SHOP_FILTERS.maxPrice) params.set("maxPrice", String(state.maxPrice));
  if (state.material) params.set("material", state.material);
  if (state.inStock) params.set("inStock", "true");
  if (state.bestseller) params.set("bestseller", "true");
  if (state.featured) params.set("featured", "true");
  if (state.newArrival) params.set("newArrival", "true");
  if (state.sort !== "featured") params.set("sort", state.sort);
  if (state.q.trim()) params.set("q", state.q.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function ArchiveProductCard({
  product,
  index,
  layoutMode,
}: {
  product: CatalogProduct;
  index: number;
  layoutMode: ArchiveLayoutMode;
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlistItem = useWishlistStore((s) => s.toggleWishlistItem);
  const setQuickInspect = useUIStore((s) => s.setQuickInspectProduct);

  const [variantIdx, setVariantIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const activeVariant = product.variants[variantIdx] ?? product.variants[0];
  const effectivePriceUsd = product.price_usd + (activeVariant?.price_modifier_usd ?? 0);
  const primaryImage = product.images?.[0] ?? "/images/products/aether-01-headphones.png";
  const isGallery = layoutMode === "gallery-2";
  const isSaved = wishlistItems.some((w) => w.productId === product.id);

  const handleAdd = () => {
    addItem(buildCartItemFromProduct(product, activeVariant), true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  if (layoutMode === "ledger") {
    return (
      <motion.li
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="group rounded-[20px] border border-line bg-surface p-3.5 transition-colors hover:border-line-strong md:p-4"
      >
        <article className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: Thumbnail + SKU + Title + Material Tags */}
          <div className="flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-[#EFECE6] sm:size-24">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-muted">
                <span className="rounded bg-canvas px-2 py-0.5 text-ink">
                  {activeVariant?.sku ?? product.sku}
                </span>
                <span>{CATEGORY_SHORT_LABELS[product.category_slug].toUpperCase()}</span>
                <span className="text-sage">● IN STOCK ({activeVariant?.stock_count ?? product.stock_count})</span>
              </div>
              <h3 className="mt-1.5 font-display text-[26px] leading-tight text-ink sm:text-[30px]">
                <Link
                  href={`/product/${product.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {product.title}
                </Link>
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {product.materials.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-line bg-canvas px-2.5 py-0.5 font-mono text-[9.5px] tracking-wider text-muted"
                  >
                    {m.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Swatches + Price + Quick Inspect + Add to Bag */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-3 md:border-t-0 md:pt-0">
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label={`${product.title} finish`}>
              {product.variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={i === variantIdx}
                  aria-label={v.variant_name}
                  title={v.variant_name}
                  onClick={() => setVariantIdx(i)}
                  className={cn(
                    "size-5 rounded-full border transition-transform",
                    i === variantIdx ? "scale-110 border-ink ring-2 ring-ink/25" : "border-line-strong hover:scale-105",
                  )}
                  style={{ backgroundColor: v.color_hex }}
                />
              ))}
            </div>

            <p className="tabular min-w-[92px] text-right font-mono text-[16.5px] font-medium text-ink">
              {formatPrice(effectivePriceUsd, currency)}
            </p>

            <div className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={() => setQuickInspect(product)}
                className="h-10 rounded-full border border-line-strong bg-canvas px-3.5 font-mono text-[10px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
              >
                Quick Inspect [+]
              </button>
              <MagneticButton
                size="sm"
                variant={added ? "surface" : "primary"}
                onClick={handleAdd}
                aria-label={`Add ${product.title} to bag`}
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
        </article>
      </motion.li>
    );
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt3DCard className="group h-full">
        <article className="flex h-full flex-col p-3">
          {/* Studio Product Photo Container */}
          <div
            className={cn(
              "relative overflow-hidden rounded-[18px] bg-[#EFECE6]",
              isGallery ? "aspect-[16/11]" : "aspect-[4/5]",
            )}
          >
            <Image
              src={primaryImage}
              alt={`${product.title} — ${activeVariant?.variant_name ?? product.three_d_config.finish}`}
              fill
              sizes={
                isGallery
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              loading={index < 3 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#141413]/65 via-[#141413]/20 to-transparent"
            />

            {/* Top-left status badges */}
            <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
              {product.is_bestseller && (
                <span className="glass rounded-full border border-sage/45 px-2.5 py-1 font-mono text-[9.5px] font-medium tracking-wider text-sage">
                  ● BESTSELLER
                </span>
              )}
              {product.is_featured && !product.is_bestseller && (
                <span className="glass rounded-full border border-line-strong px-2.5 py-1 font-mono text-[9.5px] font-medium tracking-wider text-ink">
                  ● FEATURED
                </span>
              )}
              {product.is_new_arrival && (
                <span className="glass rounded-full border border-accent/45 px-2.5 py-1 font-mono text-[9.5px] font-medium tracking-wider text-accent">
                  ● NEW ARRIVAL
                </span>
              )}
            </div>

            {/* Top-right category tag */}
            <span className="absolute right-3 top-3 z-10 rounded-full bg-[#141413]/85 px-2.5 py-1 font-mono text-[9.5px] tracking-wider text-[#F7F4EF] backdrop-blur-md">
              {CATEGORY_SHORT_LABELS[product.category_slug].toUpperCase()}
            </span>

            {/* Bottom studio finish + Quick Inspect [+] button */}
            <div className="absolute inset-x-3.5 bottom-3 z-20 flex items-center justify-between gap-2 font-mono text-[9.5px] tracking-wider text-[#F7F4EF]/90">
              <span className="truncate">{activeVariant?.variant_name.toUpperCase()}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickInspect(product);
                }}
                className="glass pointer-events-auto relative z-20 cursor-pointer rounded-full border border-line px-3 py-1.5 font-mono text-[9.5px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
              >
                Quick Inspect [+]
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.14em] text-muted">
              <span>{activeVariant?.sku ?? product.sku}</span>
              <span className="tabular inline-flex items-center gap-1 text-ink">
                <Star className="size-3 fill-accent text-accent" strokeWidth={1.5} />
                {product.rating.toFixed(2)}
                <span className="text-muted">({product.review_count})</span>
              </span>
            </div>

            <div className="mt-2 flex items-start justify-between gap-4">
              <h3
                className={cn(
                  "font-display leading-[1.05] text-ink",
                  isGallery ? "text-[32px] sm:text-[36px]" : "text-[27px]",
                )}
              >
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

            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
              {isGallery ? product.description : product.tagline}
            </p>

            {isGallery && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.materials.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-line bg-canvas px-2.5 py-0.5 font-mono text-[9.5px] tracking-wider text-muted"
                  >
                    {m.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 mt-5">
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label={`${product.title} finish`}>
                {product.variants.map((v, idx) => {
                  const selected = idx === variantIdx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={v.variant_name}
                      title={v.variant_name}
                      onClick={() => setVariantIdx(idx)}
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

export function ShopArchiveClient({ overview }: { overview: CatalogOverview }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currency = useUIStore((s) => s.activeCurrency);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const [layoutMode, setLayoutMode] = useState<ArchiveLayoutMode>("grid-3");

  // Single source of truth synced with Next.js URL query parameters
  const filters = useMemo(
    () => parseSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const updateFilters = useCallback(
    (patch: Partial<ShopFilterState>) => {
      const next: ShopFilterState = { ...filters, ...patch };
      const qs = buildSearchString(next);
      router.replace(`${pathname}${qs}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const filteredProducts = useMemo(
    () =>
      queryProducts(overview.products, {
        categorySlug: filters.category,
        minPriceUsd: filters.minPrice,
        maxPriceUsd: filters.maxPrice,
        materialFilter: filters.material,
        inStockOnly: filters.inStock,
        bestsellerOnly: filters.bestseller,
        featuredOnly: filters.featured,
        newArrivalOnly: filters.newArrival,
        sortBy: filters.sort,
        searchQuery: filters.q,
      }),
    [overview.products, filters],
  );

  const recommendedFlagships = useMemo(
    () => overview.products.filter((p) => p.is_featured || p.is_bestseller).slice(0, 3),
    [overview.products],
  );

  const activeCategoryObj =
    filters.category === "all"
      ? null
      : overview.categories.find((c) => c.slug === filters.category) ?? null;

  const isLive = overview.status.mode === "supabase-live";

  // Build active filter chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.category !== "all") {
    activeChips.push({
      key: "cat",
      label: `CATEGORY: ${(CATEGORY_SHORT_LABELS[filters.category] ?? filters.category).toUpperCase()}`,
      onRemove: () => updateFilters({ category: "all" }),
    });
  }
  if (filters.minPrice > DEFAULT_SHOP_FILTERS.minPrice || filters.maxPrice < DEFAULT_SHOP_FILTERS.maxPrice) {
    activeChips.push({
      key: "price",
      label: `PRICE: ${formatPrice(filters.minPrice, currency)} – ${formatPrice(filters.maxPrice, currency)}`,
      onRemove: () =>
        updateFilters({
          minPrice: DEFAULT_SHOP_FILTERS.minPrice,
          maxPrice: DEFAULT_SHOP_FILTERS.maxPrice,
        }),
    });
  }
  if (filters.material) {
    const matLabel =
      ARCHIVE_MATERIALS.find((m) => m.id === filters.material)?.label ?? filters.material;
    activeChips.push({
      key: "material",
      label: `MATERIAL: ${matLabel.toUpperCase()}`,
      onRemove: () => updateFilters({ material: "" }),
    });
  }
  if (filters.inStock) {
    activeChips.push({
      key: "inStock",
      label: "IN STOCK ONLY",
      onRemove: () => updateFilters({ inStock: false }),
    });
  }
  if (filters.bestseller) {
    activeChips.push({
      key: "bestseller",
      label: "BESTSELLERS",
      onRemove: () => updateFilters({ bestseller: false }),
    });
  }
  if (filters.featured) {
    activeChips.push({
      key: "featured",
      label: "FEATURED OBJECTS",
      onRemove: () => updateFilters({ featured: false }),
    });
  }
  if (filters.newArrival) {
    activeChips.push({
      key: "newArrival",
      label: "NEW ARRIVALS",
      onRemove: () => updateFilters({ newArrival: false }),
    });
  }
  if (filters.q.trim()) {
    activeChips.push({
      key: "q",
      label: `QUERY: “${filters.q.trim().toUpperCase()}”`,
      onRemove: () => updateFilters({ q: "" }),
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-6 md:px-8 md:pb-28 md:pt-10">
      {/* 1.1 Editorial Archive Header */}
      <header className="mb-10 border-b border-line pb-8 md:mb-12">
        {/* Breadcrumb & Live Telemetry Strip */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] tracking-[0.18em] text-muted">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
            <Link href="/" className="transition-colors hover:text-ink">
              HOME
            </Link>
            <span aria-hidden>{"//"}</span>
            <span className="text-ink">OBJECT ARCHIVE</span>
            <span aria-hidden>{"//"}</span>
            <span className="inline-flex items-center gap-1.5 text-sage">
              <Database className="size-3" strokeWidth={1.75} />
              [LIVE SUPABASE CATALOG: {overview.products.length} OBJECTS]
            </span>
          </nav>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1 text-[10px] text-ink transition-colors hover:border-ink"
          >
            <Search className="size-3 text-accent" strokeWidth={1.75} />
            <span>SPOTLIGHT SEARCH [⌘K]</span>
          </button>
        </div>

        {/* Dynamic Editorial Headline & Description + 3D Layout Density Switcher */}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="font-display text-[clamp(2.65rem,5vw,4.75rem)] leading-[1.02] text-ink">
              {activeCategoryObj ? (
                activeCategoryObj.name
              ) : (
                <>
                  The Complete <em className="text-accent">Object Archive</em>
                </>
              )}
            </h1>
            <p className="mt-3 max-w-[44rem] text-[15px] leading-relaxed text-muted">
              {activeCategoryObj
                ? activeCategoryObj.description
                : "Every instrument in the AETHERIA permanent collection — precision-milled in small batches, photographed in our Warm Travertine Studio, and served live from Supabase PostgreSQL."}
            </p>
          </div>

          {/* Interactive 3D Layout Density Switcher */}
          <LayoutGroup id="archive-density-switcher">
            <div
              role="group"
              aria-label="Switch catalog layout density"
              className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-surface p-1.5 self-start lg:self-end"
            >
              {LAYOUT_MODES.map((mode) => {
                const Icon = mode.icon;
                const active = layoutMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLayoutMode(mode.id)}
                    className={cn(
                      "relative inline-flex h-10 items-center gap-2 rounded-xl px-3 font-mono text-[10px] font-medium tracking-[0.13em] transition-colors",
                      active ? "text-canvas" : "text-muted hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-layout-mode-pill"
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                        className="absolute inset-0 rounded-xl bg-ink"
                      />
                    )}
                    <Icon className="relative z-10 size-3.5" strokeWidth={1.75} />
                    <span className="relative z-10">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </header>

      {/* Main 12-Column Split: Left Sticky Filter Sidebar (3 cols) + Right Catalog Stage (9 cols) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <ShopFilterSidebar
          categories={overview.categories}
          products={overview.products}
          filters={filters}
          resultCount={filteredProducts.length}
          onUpdate={updateFilters}
          onReset={resetFilters}
        />

        <div className="lg:col-span-9">
          {/* Active Filter Chips Bar & Telemetry */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10.5px] tracking-[0.16em] text-ink">
                SHOWING {filteredProducts.length} OF {overview.products.length} OBJECTS
              </span>

              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1 font-mono text-[9.5px] tracking-wider text-ink transition-colors hover:border-accent hover:bg-accent hover:text-accent-on"
                >
                  <span>[ {chip.label} × ]</span>
                </button>
              ))}

              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-1 font-mono text-[10px] tracking-wider text-accent underline underline-offset-4 hover:text-ink"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <span className="font-mono text-[10px] tracking-[0.15em] text-muted">
              {isLive ? "SUPABASE LIVE · RLS VERIFIED" : "RESILIENT SEED FALLBACK"}
            </span>
          </div>

          {/* Product Grid / Gallery / Ledger or Empty State */}
          {filteredProducts.length > 0 ? (
            <motion.ul
              layout
              className={cn(
                layoutMode === "grid-3" && "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3",
                layoutMode === "gallery-2" && "grid grid-cols-1 gap-6 md:grid-cols-2",
                layoutMode === "ledger" && "flex flex-col gap-3.5",
              )}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <ArchiveProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    layoutMode={layoutMode}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            /* Empty State Recovery + 3 Recommended Flagship Products */
            <div className="space-y-10">
              <div className="rounded-[26px] border border-line-strong bg-surface p-8 text-center md:p-12">
                <p className="font-mono text-[10.5px] tracking-[0.2em] text-accent">
                  0 MATCHING OBJECTS // ARCHIVE QUERY EMPTY
                </p>
                <h2 className="mt-3 font-display text-[40px] leading-none text-ink sm:text-[52px]">
                  No Matching Objects in Archive
                </h2>
                <p className="mx-auto mt-3 max-w-[32rem] text-[14.5px] leading-relaxed text-muted">
                  No objects in the permanent collection match all of your active material, valuation,
                  and department constraints simultaneously.
                </p>
                <div className="mt-6 flex justify-center">
                  <MagneticButton size="md" variant="primary" onClick={resetFilters}>
                    <RotateCcw className="size-4" strokeWidth={1.75} />
                    Reset All Archive Filters
                  </MagneticButton>
                </div>
              </div>

              <div>
                <p className="mb-4 font-mono text-[10.5px] tracking-[0.18em] text-muted">
                  RECOMMENDED FLAGSHIP OBJECTS FROM LIVE ARCHIVE
                </p>
                <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {recommendedFlagships.map((product, i) => (
                    <ArchiveProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      layoutMode="grid-3"
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
