"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Heart, Plus, Star } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { buildWishlistItemFromProduct, useWishlistStore } from "@/store/useWishlistStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct } from "@/types/database";

function BestsellerCard({
  product,
  index,
  rotateY,
}: {
  product: CatalogProduct;
  index: number;
  rotateY: MotionValue<number>;
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlistItem = useWishlistStore((s) => s.toggleWishlistItem);
  const [variantIdx, setVariantIdx] = useState(0);
  const [addedTick, setAddedTick] = useState(0);
  const [added, setAdded] = useState(false);

  const variant = product.variants[variantIdx] ?? product.variants[0];
  const price = product.price_usd + (variant?.price_modifier_usd ?? 0);
  const image = product.images?.[0] ?? null;
  const isSaved = wishlistItems.some((w) => w.productId === product.id);

  const handleAdd = () => {
    addItem(buildCartItemFromProduct(product, variant), true);
    setAddedTick((t) => t + 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <li className="w-[80vw] max-w-[360px] shrink-0 snap-start [perspective:1200px] sm:w-[340px] lg:w-[360px]">
      <motion.article
        style={{ rotateY, transformStyle: "preserve-3d" }}
        className="group flex h-full flex-col rounded-[24px] border border-line bg-surface p-3 shadow-[0_30px_60px_-40px_rgb(var(--shadow-tint)/0.5)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#EFECE6]">
          {image && (
            <Image
              src={image}
              alt={`${product.title} — ${variant?.variant_name ?? ""}`}
              fill
              draggable={false}
              sizes="(max-width: 640px) 80vw, 360px"
              className="pointer-events-none object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-105"
            />
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141413]/55 to-transparent"
          />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between">
            <span
              className={cn(
                "glass rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-medium tracking-wider",
                product.is_bestseller ? "border-sage/45 text-sage" : "border-line-strong text-ink",
              )}
            >
              ● {product.is_bestseller ? "BESTSELLER" : "FEATURED"}
            </span>
            <span className="rounded-full bg-[#141413]/80 px-2.5 py-1 font-mono text-[9.5px] tracking-wider text-[#F7F4EF] backdrop-blur-md">
              № {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <button
            type="button"
            aria-pressed={isSaved}
            aria-label={`Save ${product.title} to wishlist`}
            onClick={() => toggleWishlistItem(buildWishlistItemFromProduct(product, variant))}
            className="glass absolute bottom-3 right-3 inline-flex size-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <Heart className={cn("size-3.5", isSaved && "fill-accent text-accent")} strokeWidth={1.75} />
          </button>
          <p className="pointer-events-none absolute bottom-3 left-3.5 font-mono text-[9.5px] tracking-wider text-[#F7F4EF]/90">
            {product.sku}
          </p>
        </div>

        <div className="flex flex-1 flex-col px-1.5 pb-1 pt-4">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-muted">
            <span>{product.three_d_config.finish.toUpperCase()}</span>
            <span className="tabular inline-flex items-center gap-1 text-ink">
              <Star className="size-3 fill-accent text-accent" strokeWidth={1.5} />
              {product.rating.toFixed(2)}
            </span>
          </div>
          <h3 className="mt-2 font-display text-[26px] leading-[1.06] text-ink">
            <Link
              href={`/product/${product.slug}`}
              className="transition-colors hover:text-accent"
            >
              {product.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-[13px] text-muted">{product.tagline}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
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
              <p aria-live="polite" className="mt-1.5 truncate font-mono text-[10px] tracking-wider text-muted">
                {variant?.variant_name.toUpperCase()}
              </p>
            </div>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={`${currency}-${price}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="tabular shrink-0 font-mono text-[16px] font-medium text-ink"
              >
                {formatPrice(price, currency)}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="relative mt-4 border-t border-line pt-4">
            <AnimatePresence>
              {added && (
                <motion.span
                  key={addedTick}
                  aria-hidden
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute right-4 top-1 font-mono text-[11px] font-medium text-accent"
                >
                  +1 BAG
                </motion.span>
              )}
            </AnimatePresence>
            <MagneticButton
              size="sm"
              variant={added ? "surface" : "primary"}
              onClick={handleAdd}
              className="w-full"
              aria-label={`Add ${product.title} (${variant?.variant_name ?? "default"}) to bag`}
            >
              {added ? (
                <>
                  <Check className="size-3.5" strokeWidth={2} /> Added to Bag
                </>
              ) : (
                <>
                  Add to Bag <Plus className="size-3.5" strokeWidth={2} />
                </>
              )}
            </MagneticButton>
          </div>
        </div>
      </motion.article>
    </li>
  );
}

export function BestsellerCarousel({ products }: { products: CatalogProduct[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });

  const { scrollX, scrollXProgress } = useScroll({ container: trackRef });
  const velocity = useVelocity(scrollX);
  const smoothVelocity = useSpring(velocity, { stiffness: 200, damping: 40, mass: 0.6 });
  const rotateY = useTransform(smoothVelocity, [-2400, 0, 2400], [6, 0, -6], { clamp: true });
  const progressScale = useSpring(scrollXProgress, { stiffness: 160, damping: 30 });

  useMotionValueEvent(scrollXProgress, "change", (p) => {
    const start = p <= 0.01;
    const end = p >= 0.99;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  });

  const step = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    const width = card ? card.getBoundingClientRect().width + 20 : 360;
    track.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    drag.current = { active: true, startX: e.clientX, startLeft: trackRef.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.active || !trackRef.current) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) trackRef.current.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
  };
  const onClickCapture = (e: MouseEvent<HTMLUListElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section id="bestsellers" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 md:px-8">
        <header className="mb-10 grid gap-6 border-t border-line pt-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
              § 02 — CURATED BESTSELLERS // LIVE SUPABASE PRODUCTS
            </p>
            <h2 className="font-display text-[44px] text-ink sm:text-[60px] lg:text-[74px]">
              Collected, <em className="text-accent">then kept.</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <MagneticButton
              variant="outline"
              size="md"
              className="w-12 px-0"
              onClick={() => step(-1)}
              disabled={edges.start}
              aria-label="Previous bestsellers"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} />
            </MagneticButton>
            <MagneticButton
              variant="primary"
              size="md"
              className="w-12 px-0"
              onClick={() => step(1)}
              disabled={edges.end}
              aria-label="Next bestsellers"
            >
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </MagneticButton>
          </div>
        </header>
      </div>

      <ul
        ref={trackRef}
        aria-label="Curated bestsellers"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className={cn(
          "no-scrollbar relative flex gap-5 overflow-x-auto overscroll-x-contain px-5 pb-6 pt-2 md:px-8",
          "scroll-px-5 md:scroll-px-8 lg:px-[max(2rem,calc((100vw_-_1600px)/2_+_2rem))]",
          dragging ? "cursor-grabbing select-none snap-none" : "cursor-grab snap-x snap-mandatory",
        )}
      >
        {products.map((p, i) => (
          <BestsellerCard key={p.id} product={p} index={i} rotateY={rotateY} />
        ))}
        <li aria-hidden className="w-1 shrink-0" />
      </ul>

      <div className="mx-auto mt-4 flex max-w-[1600px] items-center gap-4 px-5 font-mono text-[10px] tracking-[0.18em] text-muted md:px-8">
        <span>DRAG / SCROLL</span>
        <div className="relative h-px flex-1 overflow-hidden bg-line">
          <motion.div style={{ scaleX: progressScale }} className="absolute inset-0 origin-left bg-ink" />
        </div>
        <span className="tabular">{String(products.length).padStart(2, "0")} OBJECTS</span>
      </div>
    </section>
  );
}
