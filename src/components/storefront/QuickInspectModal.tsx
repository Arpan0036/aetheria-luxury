"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Minus, Plus, ShieldCheck, Star, X } from "lucide-react";
import { Tilt3DCard } from "@/components/motion/Tilt3DCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct, CategorySlug } from "@/types/database";

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio & Acoustics",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

function QuickInspectDialogBody({
  product,
  onClose,
}: {
  product: CatalogProduct;
  onClose: () => void;
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const addItem = useCartStore((s) => s.addItem);

  const [variantIdx, setVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const activeVariant = product.variants[variantIdx] ?? product.variants[0];
  const unitPriceUsd = product.price_usd + (activeVariant?.price_modifier_usd ?? 0);
  const totalPriceUsd = unitPriceUsd * quantity;
  const activeSku = activeVariant?.sku ?? product.sku;
  const activeStock = activeVariant?.stock_count ?? product.stock_count;
  const primaryImage = product.images?.[0] ?? "/images/products/aether-01-headphones.png";

  const handleAdd = () => {
    addItem(buildCartItemFromProduct(product, activeVariant, quantity), true);
    setAdded(true);
    onClose();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick inspect ${product.title}`}
      data-lenis-prevent
      initial={{ opacity: 0, scale: 0.94, rotateX: 6, y: 24 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, rotateX: -4, y: 18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 my-auto max-h-[90dvh] w-full max-w-[1040px] overflow-y-auto rounded-[28px] border border-line-strong bg-canvas p-5 shadow-[0_50px_140px_-40px_rgb(var(--shadow-tint)/0.65)] md:p-8"
    >
      {/* Top Bar */}
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted">
          <span className="text-ink">3D SPATIAL QUICK INSPECT</span>
          <span aria-hidden>{"//"}</span>
          <span>{CATEGORY_LABELS[product.category_slug].toUpperCase()}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick inspect modal"
          className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-9">
        {/* Left Column: High-res studio image inside 3D tilt frame + status badges */}
        <div className="lg:col-span-5">
          <Tilt3DCard maxTilt={8} className="h-full">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#EFECE6]">
              <Image
                src={primaryImage}
                alt={`${product.title} — ${activeVariant?.variant_name ?? product.three_d_config.finish}`}
                fill
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#141413]/70 via-[#141413]/20 to-transparent"
              />

              {/* Status Badges: IN STOCK, SKU, RATING */}
              <div className="absolute inset-x-3.5 top-3.5 flex flex-wrap items-center justify-between gap-2 [transform:translateZ(30px)]">
                <span className="glass inline-flex items-center gap-1.5 rounded-full border border-sage/45 px-3 py-1 font-mono text-[9.5px] font-medium tracking-wider text-sage">
                  ● IN STOCK ({activeStock})
                </span>
                <span className="rounded-full bg-[#141413]/85 px-3 py-1 font-mono text-[9.5px] tracking-wider text-[#F7F4EF] backdrop-blur-md">
                  {activeSku}
                </span>
              </div>

              <div className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-between font-mono text-[10px] tracking-wider text-[#F7F4EF] [transform:translateZ(30px)]">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-accent text-accent" strokeWidth={1.5} />
                  {product.rating.toFixed(2)} ({product.review_count} REVIEWS)
                </span>
                <span>{activeVariant?.variant_name.toUpperCase()}</span>
              </div>
            </div>
          </Tilt3DCard>
        </div>

        {/* Right Column: Title, Variant Selector, Architectural Specs Grid, Quantity & CTA */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            {/* SKU & Rating Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10.5px] tracking-[0.16em] text-muted">
              <span>ARCHIVE REF // {activeSku}</span>
              <span className="text-sage">● {activeStock} UNITS READY FOR DISPATCH</span>
            </div>

            {/* Title & Live Currency Price */}
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-display text-[36px] leading-[1.02] text-ink sm:text-[44px]">
                {product.title}
              </h2>
              <div className="text-right">
                <p className="tabular font-mono text-[22px] font-medium text-ink">
                  {formatPrice(unitPriceUsd, currency)}
                </p>
                {product.compare_at_price_usd && (
                  <p className="tabular font-mono text-[11px] text-muted line-through">
                    {formatPrice(product.compare_at_price_usd, currency)}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-2 font-display text-[20px] italic text-accent">{product.tagline}</p>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{product.description}</p>

            {/* Interactive Color / Finish Variant Selector */}
            <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-muted">
                <span>SURFACE FINISH // {activeVariant?.variant_name.toUpperCase()}</span>
                <span className="tabular text-ink">
                  {activeVariant?.price_modifier_usd
                    ? `+${formatPrice(activeVariant.price_modifier_usd, currency)}`
                    : "INCLUDED"}
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label="Select product finish variant"
                className="mt-3 flex flex-wrap gap-2"
              >
                {product.variants.map((v, i) => {
                  const selected = i === variantIdx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setVariantIdx(i)}
                      className={cn(
                        "inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-left text-[12.5px] font-medium transition-all",
                        selected
                          ? "border-ink bg-ink text-canvas shadow-sm"
                          : "border-line-strong bg-canvas text-ink hover:border-ink",
                      )}
                    >
                      <span
                        aria-hidden
                        className="size-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: v.color_hex }}
                      />
                      <span>{v.variant_name}</span>
                      {v.price_modifier_usd > 0 && (
                        <span
                          className={cn(
                            "tabular font-mono text-[10px]",
                            selected ? "text-canvas/75" : "text-muted",
                          )}
                        >
                          +{formatPrice(v.price_modifier_usd, currency)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Architectural Specs Grid (JetBrains Mono) */}
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line font-mono text-[11px]">
              <div className="bg-canvas p-3">
                <dt className="text-[9.5px] tracking-[0.16em] text-muted">DIMENSIONS</dt>
                <dd className="mt-1 text-ink">{product.dimensions}</dd>
              </div>
              <div className="bg-canvas p-3">
                <dt className="text-[9.5px] tracking-[0.16em] text-muted">WEIGHT</dt>
                <dd className="mt-1 text-ink">{product.weight}</dd>
              </div>
              <div className="bg-canvas p-3">
                <dt className="text-[9.5px] tracking-[0.16em] text-muted">PRIMARY MATERIALS</dt>
                <dd className="mt-1 truncate text-ink" title={product.materials.join(" · ")}>
                  {product.materials.join(" · ")}
                </dd>
              </div>
              <div className="bg-canvas p-3">
                <dt className="text-[9.5px] tracking-[0.16em] text-muted">WARRANTY</dt>
                <dd className="mt-1 truncate text-ink" title={product.warranty_info}>
                  {product.warranty_info}
                </dd>
              </div>
            </dl>
          </div>

          {/* Quantity Adjuster + Primary Add to Bag + Full 3D Showcase Link */}
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex flex-wrap items-center gap-3">
              {/* Quantity Stepper */}
              <div
                aria-label="Quantity selector"
                className="inline-flex h-12 items-center rounded-full border border-line-strong bg-surface px-1.5"
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="inline-flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas"
                >
                  <Minus className="size-3.5" strokeWidth={1.75} />
                </button>
                <span className="tabular min-w-9 text-center font-mono text-[13px] font-medium text-ink">
                  {String(quantity).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                  aria-label="Increase quantity"
                  className="inline-flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas"
                >
                  <Plus className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>

              <MagneticButton
                size="md"
                variant={added ? "surface" : "primary"}
                onClick={handleAdd}
                className="flex-1"
              >
                {added ? (
                  <>
                    <Check className="size-4" strokeWidth={2} /> Added {quantity} to Bag
                  </>
                ) : (
                  <>
                    <Plus className="size-4" strokeWidth={2} /> Add to Bag —{" "}
                    <span className="tabular font-mono">{formatPrice(totalPriceUsd, currency)}</span>
                  </>
                )}
              </MagneticButton>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-muted">
                <ShieldCheck className="size-3.5 text-sage" strokeWidth={1.75} />
                COMPLIMENTARY EXPRESS COURIER · SERIALISED CERTIFICATE
              </span>
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-[0.12em] text-ink transition-colors hover:text-accent"
              >
                View Full 3D Product Showcase
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function QuickInspectModal() {
  const product = useUIStore((s) => s.quickInspectProduct);
  const setProduct = useUIStore((s) => s.setQuickInspectProduct);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setProduct(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [product, setProduct]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="quick-inspect-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setProduct(null)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0D0C0B]/55 p-4 backdrop-blur-md [perspective:1400px] sm:p-6"
        >
          <QuickInspectDialogBody
            key={product.id}
            product={product}
            onClose={() => setProduct(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
