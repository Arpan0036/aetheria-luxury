"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plane,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Tilt3DCard } from "@/components/motion/Tilt3DCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { scrollToTarget } from "@/components/motion/SmoothScrollProvider";
import { ProductMediaStage } from "./ProductMediaStage";
import { ProductReviewsSection } from "./ProductReviewsSection";
import { StickyProductBar } from "./StickyProductBar";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { buildWishlistItemFromProduct, useWishlistStore } from "@/store/useWishlistStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct, CategorySlug, ProductDetail, Review } from "@/types/database";

const CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

const TRUST_CARDS = [
  {
    icon: Plane,
    code: "EXPRESS AIR DISPATCH",
    body: "Complimentary insured shipping to US, UK, EU & AU on orders over $150.",
  },
  {
    icon: ShieldCheck,
    code: "10-YEAR ARCHIVE WARRANTY",
    body: "Serialized CNC chassis guarantee with direct replacement support.",
  },
  {
    icon: RotateCcw,
    code: "30-DAY SANCTUARY TRIAL",
    body: "Risk-free in-home acoustic & architectural evaluation.",
  },
] as const;

function CrossSellCard({ product }: { product: CatalogProduct }) {
  const currency = useUIStore((s) => s.activeCurrency);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const primaryImage = product.images?.[0] ?? "/images/products/aether-01-headphones.png";

  const handleAdd = () => {
    addItem(buildCartItemFromProduct(product), true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <li>
      <Tilt3DCard className="group h-full">
        <article className="flex h-full flex-col p-3">
          <Link
            href={`/product/${product.slug}`}
            className="relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-[#EFECE6]"
          >
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141413]/60 to-transparent"
            />
            <span className="absolute left-3 top-3 rounded-full bg-[#141413]/80 px-2.5 py-1 font-mono text-[9.5px] tracking-wider text-[#F7F4EF] backdrop-blur-md">
              {product.sku}
            </span>
            <span className="absolute right-3 top-3 glass rounded-full border border-line px-2.5 py-1 font-mono text-[9.5px] tracking-wider text-ink">
              {CATEGORY_SHORT_LABELS[product.category_slug].toUpperCase()}
            </span>
          </Link>

          <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/product/${product.slug}`}
                className="font-display text-[26px] leading-[1.06] text-ink transition-colors hover:text-accent"
              >
                {product.title}
              </Link>
              <span className="tabular shrink-0 font-mono text-[15.5px] font-medium text-ink">
                {formatPrice(product.price_usd, currency)}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-[13px] text-muted">{product.tagline}</p>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 mt-4">
              <Link
                href={`/product/${product.slug}`}
                className="inline-flex items-center gap-1 font-mono text-[10.5px] tracking-wider text-ink transition-colors hover:text-accent"
              >
                INSPECT OBJECT <ArrowRight className="size-3" strokeWidth={1.75} />
              </Link>

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
      </Tilt3DCard>
    </li>
  );
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: ProductDetail;
  relatedProducts: CatalogProduct[];
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlistItem = useWishlistStore((s) => s.toggleWishlistItem);

  const [variantIdx, setVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("01");
  const [reviews, setReviews] = useState<Review[]>(product.reviews);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);

  const primaryCtaRef = useRef<HTMLDivElement>(null);

  const activeVariant = product.variants[variantIdx] ?? product.variants[0];
  const unitPriceUsd = product.price_usd + (activeVariant?.price_modifier_usd ?? 0);
  const totalPriceUsd = unitPriceUsd * quantity;
  const activeSku = activeVariant?.sku ?? product.sku;
  const activeStock = activeVariant?.stock_count ?? product.stock_count;
  const isWishlisted = wishlistItems.some((w) => w.productId === product.id);

  const totalReviewCount = Math.max(product.review_count, reviews.length);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : product.rating;

  // Show Sticky Bottom Conversion Bar once the user scrolls past the primary CTA
  useEffect(() => {
    const el = primaryCtaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const passedTop = entry.boundingClientRect.top < 0;
        setStickyBarVisible(!entry.isIntersecting && passedTop);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handlePrimaryAdd = () => {
    addItem(buildCartItemFromProduct(product, activeVariant, quantity), true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1700);
  };

  const handleReviewSubmitted = (created: Review) => {
    setReviews((prev) => [created, ...prev]);
  };

  const specEntries = Object.entries(product.specs ?? {});

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-6 md:px-8 md:pb-32 md:pt-10">
        {/* 1. Top Breadcrumb & Live Telemetry Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 font-mono text-[10.5px] tracking-[0.18em] text-muted">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
            <Link href="/" className="transition-colors hover:text-ink">
              HOME
            </Link>
            <span aria-hidden>{"//"}</span>
            <Link href="/shop" className="transition-colors hover:text-ink">
              OBJECT ARCHIVE
            </Link>
            <span aria-hidden>{"//"}</span>
            <Link
              href={`/shop?category=${product.category_slug}`}
              className="transition-colors hover:text-ink"
            >
              {product.category.name.toUpperCase()}
            </Link>
            <span aria-hidden>{"//"}</span>
            <span className="text-ink">{activeSku}</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full border border-sage/45 bg-sage/10 px-3 py-1 font-medium text-sage">
            ● IN ARCHIVE — READY FOR DISPATCH
          </span>
        </div>

        {/* Split-Screen Architectural PDP Layout */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column (lg:col-span-7): Sticky Interactive Media & 3D Stage */}
          <div className="lg:sticky lg:top-28 lg:col-span-7">
            <ProductMediaStage product={product} activeVariant={activeVariant} />
          </div>

          {/* Right Column (lg:col-span-5): Precision Configuration & Conversion Deck */}
          <div className="lg:col-span-5">
            {/* 3.1 Header & Dynamic Pricing */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.16em]">
                <Link
                  href={`/shop?category=${product.category_slug}`}
                  className="rounded-full border border-line-strong bg-surface px-3 py-1 text-ink transition-colors hover:border-ink"
                >
                  {CATEGORY_SHORT_LABELS[product.category_slug].toUpperCase()}
                </Link>
                <span className="rounded-full border border-line bg-canvas px-3 py-1 text-muted">
                  SKU: {activeSku}
                </span>
              </div>

              {/* Rating Summary Link -> Smoothly scrolls to Verified Collector Reviews */}
              <button
                type="button"
                onClick={() => scrollToTarget("#collector-reviews")}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10.5px] text-ink transition-colors hover:border-accent"
              >
                <Star className="size-3.5 fill-accent text-accent" strokeWidth={1.5} />
                <span className="tabular font-medium">{avgRating.toFixed(2)} ★</span>
                <span className="text-muted underline underline-offset-2">
                  ({totalReviewCount} Verified)
                </span>
              </button>
            </div>

            <h1 className="mt-4 font-display text-4xl leading-[1.02] text-ink lg:text-5xl">
              {product.title}
            </h1>
            <p className="mt-2 font-display text-[22px] italic text-accent">{product.tagline}</p>

            {/* Live Price Calculator */}
            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4 border-y border-line py-4">
              <div className="flex items-baseline gap-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={`${currency}-${unitPriceUsd}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="tabular font-mono text-[28px] font-medium text-ink"
                  >
                    {formatPrice(unitPriceUsd, currency)}
                  </motion.span>
                </AnimatePresence>

                {product.compare_at_price_usd && (
                  <span className="tabular font-mono text-[14px] text-muted line-through">
                    {formatPrice(product.compare_at_price_usd, currency)}
                  </span>
                )}
              </div>

              <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
                TAXES &amp; DDP DUTIES INCLUDED
              </span>
            </div>

            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{product.description}</p>

            {/* 3.2 Interactive Variant Selector (product_variants from Supabase) */}
            <div className="mt-6 rounded-[22px] border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em]">
                <span className="text-muted">
                  01 // SURFACE FINISH:{" "}
                  <strong className="font-medium text-ink">
                    {activeVariant?.variant_name.toUpperCase()}
                  </strong>
                </span>
                <span className="tabular text-ink">{activeVariant?.color_hex}</span>
              </div>

              {/* Circular Swatches + Variant Name Pills */}
              <div
                role="radiogroup"
                aria-label="Select product finish variant"
                className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {product.variants.map((v, i) => {
                  const selected = i === variantIdx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setVariantIdx(i);
                        setQuantity((q) => Math.min(q, Math.max(1, v.stock_count)));
                      }}
                      className={cn(
                        "flex items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all",
                        selected
                          ? "border-ink bg-ink text-canvas shadow-sm"
                          : "border-line-strong bg-canvas text-ink hover:border-ink",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className="size-4 shrink-0 rounded-full border border-white/35 shadow-inner"
                          style={{ backgroundColor: v.color_hex }}
                        />
                        <span className="truncate text-[13px] font-medium">{v.variant_name}</span>
                      </span>
                      <span
                        className={cn(
                          "tabular shrink-0 font-mono text-[10px]",
                          selected ? "text-canvas/75" : "text-muted",
                        )}
                      >
                        {v.price_modifier_usd > 0
                          ? `+${formatPrice(v.price_modifier_usd, currency)}`
                          : "BASE"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Stock & SKU Telemetry for Active Variant */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[10px] tracking-[0.15em]">
                <span className={activeStock <= 10 ? "text-accent" : "text-sage"}>
                  ●{" "}
                  {activeStock <= 15
                    ? `ONLY ${activeStock} UNITS REMAINING IN THIS FINISH`
                    : `${activeStock} UNITS AVAILABLE IN THIS FINISH`}
                </span>
                <span className="text-muted">REF: {activeSku}</span>
              </div>
            </div>

            {/* 3.3 Quantity & Primary Conversion Actions */}
            <div ref={primaryCtaRef} className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Tactile Quantity Stepper */}
                <div
                  aria-label="Quantity selector"
                  className="inline-flex h-14 items-center rounded-full border border-line-strong bg-surface px-2"
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas"
                  >
                    <Minus className="size-4" strokeWidth={1.75} />
                  </button>
                  <span className="tabular min-w-10 text-center font-mono text-[14px] font-medium text-ink">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                    aria-label="Increase quantity"
                    className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas"
                  >
                    <Plus className="size-4" strokeWidth={1.75} />
                  </button>
                </div>

                {/* Primary Add Object to Bag MagneticButton */}
                <MagneticButton
                  size="lg"
                  variant={added ? "surface" : "primary"}
                  onClick={handlePrimaryAdd}
                  className="flex-1"
                >
                  {added ? (
                    <>
                      <Check className="size-4" strokeWidth={2} /> Added {quantity} to Bag —{" "}
                      <span className="tabular font-mono">
                        {formatPrice(totalPriceUsd, currency)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" strokeWidth={2} /> Add Object to Bag —{" "}
                      <span className="tabular font-mono">
                        {formatPrice(totalPriceUsd, currency)}
                      </span>
                    </>
                  )}
                </MagneticButton>
              </div>

              {/* Secondary Save to Collector Wishlist Toggle Button */}
              <button
                type="button"
                aria-pressed={isWishlisted}
                onClick={() =>
                  toggleWishlistItem(buildWishlistItemFromProduct(product, activeVariant))
                }
                className={cn(
                  "flex h-12 w-full items-center justify-center gap-2 rounded-full border font-mono text-[11px] font-medium tracking-[0.15em] transition-all",
                  isWishlisted
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line-strong bg-canvas text-ink hover:border-ink",
                )}
              >
                <Heart
                  className={cn("size-4", isWishlisted && "fill-accent text-accent")}
                  strokeWidth={1.75}
                />
                <span>
                  {isWishlisted
                    ? "SAVED TO COLLECTOR WISHLIST ♥"
                    : "SAVE TO COLLECTOR WISHLIST ♡"}
                </span>
              </button>
            </div>

            {/* 3.4 Tier-1 Collector Trust & Logistics Ledger */}
            <ul className="mt-7 grid grid-cols-1 gap-2.5">
              {TRUST_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <li
                    key={card.code}
                    className="flex items-start gap-3.5 rounded-2xl border border-line bg-surface/75 p-3.5"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-accent">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-ink">
                        {card.code}
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{card.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* 3.5 Architectural Specification Accordions (Framer Motion height animation) */}
            <div className="mt-7 divide-y divide-line rounded-[22px] border border-line bg-surface">
              {/* Accordion 01: DIMENSIONS, MASS & MATERIALS */}
              <div>
                <button
                  type="button"
                  aria-expanded={openAccordion === "01"}
                  onClick={() => setOpenAccordion((curr) => (curr === "01" ? "" : "01"))}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-mono text-[11px] font-medium tracking-[0.16em] text-ink"
                >
                  <span>01 // DIMENSIONS, MASS &amp; MATERIALS</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted transition-transform duration-300",
                      openAccordion === "01" && "rotate-180 text-ink",
                    )}
                    strokeWidth={1.75}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordion === "01" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 px-5 pb-5">
                        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line font-mono text-[11px]">
                          <div className="bg-canvas p-3">
                            <dt className="text-[9.5px] tracking-wider text-muted">DIMENSIONS</dt>
                            <dd className="mt-1 text-ink">{product.dimensions}</dd>
                          </div>
                          <div className="bg-canvas p-3">
                            <dt className="text-[9.5px] tracking-wider text-muted">MASS</dt>
                            <dd className="mt-1 text-ink">{product.weight}</dd>
                          </div>
                          {specEntries.map(([label, val]) => (
                            <div key={label} className="bg-canvas p-3">
                              <dt className="text-[9.5px] tracking-wider text-muted">
                                {label.toUpperCase()}
                              </dt>
                              <dd className="mt-1 text-ink">{val}</dd>
                            </div>
                          ))}
                        </dl>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {product.materials.map((mat) => (
                            <span
                              key={mat}
                              className="rounded-full border border-line-strong bg-canvas px-3 py-1 font-mono text-[10px] tracking-wider text-ink"
                            >
                              {mat.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 02: ACOUSTIC & OPTICAL ENGINEERING */}
              <div>
                <button
                  type="button"
                  aria-expanded={openAccordion === "02"}
                  onClick={() => setOpenAccordion((curr) => (curr === "02" ? "" : "02"))}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-mono text-[11px] font-medium tracking-[0.16em] text-ink"
                >
                  <span>02 // ACOUSTIC &amp; OPTICAL ENGINEERING</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted transition-transform duration-300",
                      openAccordion === "02" && "rotate-180 text-ink",
                    )}
                    strokeWidth={1.75}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordion === "02" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2.5 px-5 pb-5 text-[13.5px] leading-relaxed text-muted">
                        <p>
                          Machined to ±0.01mm tolerances in small archival runs. Each chassis is
                          hand-finished in our Warm Travertine Studio and calibrated individually
                          prior to serialization.
                        </p>
                        <p className="font-mono text-[10.5px] tracking-wider text-ink">
                          WARRANTY: {product.warranty_info.toUpperCase()}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 03: SHIPPING, CUSTOMS & RETURNS */}
              <div>
                <button
                  type="button"
                  aria-expanded={openAccordion === "03"}
                  onClick={() => setOpenAccordion((curr) => (curr === "03" ? "" : "03"))}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-mono text-[11px] font-medium tracking-[0.16em] text-ink"
                >
                  <span>03 // SHIPPING, CUSTOMS &amp; RETURNS</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted transition-transform duration-300",
                      openAccordion === "03" && "rotate-180 text-ink",
                    )}
                    strokeWidth={1.75}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordion === "03" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2.5 px-5 pb-5 text-[13.5px] leading-relaxed text-muted">
                        <p>
                          Dispatched DDP (Delivered Duty Paid) via DHL Express &amp; FedEx Priority
                          to the United States, United Kingdom, European Union, Switzerland, Canada,
                          and Australia — zero additional import duties upon arrival.
                        </p>
                        <p className="font-mono text-[10.5px] tracking-wider text-ink">
                          DISPATCH WINDOW: 24–48 HOURS · 30-DAY COMPLIMENTARY RETURN COURIER
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Verified Collector Reviews & Live Supabase Review Submission */}
        <ProductReviewsSection
          product={product}
          reviews={reviews}
          onReviewSubmitted={handleReviewSubmitted}
        />

        {/* 5.1 "Complete the Architecture" 3D Cross-Sell Module */}
        <section
          aria-label="Complete the Architecture"
          className="mt-20 border-t border-line pt-16 md:mt-24 md:pt-20"
        >
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
                § 03 — COMPLETE THE ARCHITECTURE // CURATED COMPANIONS
              </p>
              <h2 className="font-display text-[40px] leading-[1.02] text-ink sm:text-[54px]">
                Complementary <em className="text-accent">Objects.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-ink transition-colors hover:text-accent"
            >
              EXPLORE ALL 12 OBJECTS <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedProducts.map((rel) => (
              <CrossSellCard key={rel.id} product={rel} />
            ))}
          </ul>
        </section>
      </div>

      {/* 5.2 Sticky Bottom Conversion Bar */}
      <StickyProductBar
        product={product}
        activeVariant={activeVariant}
        unitPriceUsd={unitPriceUsd}
        visible={stickyBarVisible}
        added={added}
        onAdd={handlePrimaryAdd}
      />
    </>
  );
}
