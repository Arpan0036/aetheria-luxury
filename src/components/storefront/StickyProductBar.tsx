"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useUIStore } from "@/store/useUIStore";
import { formatPrice } from "@/lib/utils";
import type { ProductDetail, ProductVariant } from "@/types/database";

export function StickyProductBar({
  product,
  activeVariant,
  unitPriceUsd,
  visible,
  added,
  onAdd,
}: {
  product: ProductDetail;
  activeVariant: ProductVariant;
  unitPriceUsd: number;
  visible: boolean;
  added: boolean;
  onAdd: () => void;
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const primaryImage = product.images?.[0] ?? "/images/products/aether-01-headphones.png";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-product-conversion-bar"
          role="region"
          aria-label="Sticky product conversion bar"
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "110%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-canvas/92 px-4 py-3 shadow-[0_-20px_50px_-20px_rgb(var(--shadow-tint)/0.45)] backdrop-blur-xl md:px-8"
        >
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
            {/* Left: Thumbnail + Title + Active Variant Pill */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-line bg-[#EFECE6] sm:size-12">
                <Image
                  src={primaryImage}
                  alt={product.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-[20px] leading-tight text-ink sm:text-[24px]">
                  {product.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[9.5px] tracking-[0.14em] text-muted">
                  <span className="inline-flex items-center gap-1.5 text-ink">
                    <span
                      aria-hidden
                      className="size-2 rounded-full border border-white/40"
                      style={{ backgroundColor: activeVariant.color_hex }}
                    />
                    {activeVariant.variant_name.toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">· {activeVariant.sku}</span>
                </div>
              </div>
            </div>

            {/* Right: Live Converted Price + Instant Add to Bag CTA */}
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <div className="text-right">
                <p className="tabular font-mono text-[15px] font-medium text-ink sm:text-[17px]">
                  {formatPrice(unitPriceUsd, currency)}
                </p>
                <p className="hidden font-mono text-[9px] tracking-[0.16em] text-sage sm:block">
                  ● IN ARCHIVE ({activeVariant.stock_count})
                </p>
              </div>

              <MagneticButton
                size="sm"
                variant={added ? "surface" : "primary"}
                onClick={onAdd}
                aria-label={`Add ${product.title} (${activeVariant.variant_name}) to bag`}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
