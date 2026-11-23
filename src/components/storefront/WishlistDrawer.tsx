"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, ShoppingBag, X } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUIStore } from "@/store/useUIStore";
import { formatPrice } from "@/lib/utils";

export function WishlistDrawer() {
  const isOpen = useWishlistStore((s) => s.isOpen);
  const setOpen = useWishlistStore((s) => s.setOpen);
  const items = useWishlistStore((s) => s.items);
  const removeWishlistItem = useWishlistStore((s) => s.removeWishlistItem);
  const moveItemToCart = useWishlistStore((s) => s.moveItemToCart);
  const moveAllToCart = useWishlistStore((s) => s.moveAllToCart);
  const currency = useUIStore((s) => s.activeCurrency);

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

  const countLabel = String(items.length).padStart(2, "0");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="wishlist-drawer-backdrop"
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
            aria-label="Collector Wishlist Drawer"
            data-lenis-prevent
            initial={{ x: "100%", rotateY: -6 }}
            animate={{ x: 0, rotateY: 0 }}
            exit={{ x: "100%", rotateY: -4 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex h-dvh w-full max-w-[460px] flex-col border-l border-line-strong bg-canvas shadow-[-40px_0_100px_-30px_rgb(var(--shadow-tint)/0.65)]"
          >
            {/* Header */}
            <header className="border-b border-line px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted">
                    COLLECTOR WISHLIST {"//"} [{countLabel}{" "}
                    {items.length === 1 ? "SAVED OBJECT" : "SAVED OBJECTS"}]
                  </p>
                  <h2 className="mt-1 font-display text-[32px] leading-none text-ink">
                    Saved <em className="text-accent">Archive</em>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close collector wishlist"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 font-mono text-[10px] tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                >
                  <span>ESC</span>
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>

              {items.length > 0 && (
                <div className="mt-4">
                  <MagneticButton
                    size="sm"
                    variant="primary"
                    onClick={moveAllToCart}
                    className="w-full"
                  >
                    <ShoppingBag className="size-3.5" strokeWidth={1.75} />
                    Move All Saved Objects to Bag ({items.length})
                  </MagneticButton>
                </div>
              )}
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {items.length === 0 ? (
                <div className="rounded-[24px] border border-line bg-surface p-8 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-line-strong bg-canvas text-accent">
                    <Heart className="size-6" strokeWidth={1.5} />
                  </div>
                  <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-muted">
                    WISHLIST EMPTY // 00 OBJECTS
                  </p>
                  <h3 className="mt-1.5 font-display text-[30px] leading-tight text-ink">
                    Curate Your Sanctuary
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                    Tap the heart icon on any studio instrument across the archive to save it here
                    for future acquisition.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 font-mono text-[11px] font-medium tracking-wider text-canvas transition-colors hover:bg-accent hover:text-accent-on"
                  >
                    Explore Object Archive <ArrowRight className="size-3.5" strokeWidth={1.75} />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3" aria-label="Wishlist items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-[22px] border border-line bg-surface p-3.5"
                      >
                        <div className="flex gap-3.5">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-[#EFECE6]"
                          >
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[9.5px] tracking-[0.14em] text-muted">
                                  {item.sku}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeWishlistItem(item.productId)}
                                  aria-label={`Remove ${item.title} from wishlist`}
                                  className="font-mono text-[9.5px] tracking-wider text-muted transition-colors hover:text-accent"
                                >
                                  Remove ×
                                </button>
                              </div>

                              <Link
                                href={`/product/${item.slug}`}
                                onClick={() => setOpen(false)}
                                className="mt-0.5 block font-display text-[22px] leading-[1.05] text-ink transition-colors hover:text-accent"
                              >
                                {item.title}
                              </Link>

                              <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted">
                                <span
                                  aria-hidden
                                  className="size-2.5 rounded-full border border-white/40"
                                  style={{ backgroundColor: item.defaultVariant.color_hex }}
                                />
                                <span>{item.defaultVariant.variant_name}</span>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                              <span className="tabular font-mono text-[14.5px] font-medium text-ink">
                                {formatPrice(item.priceUsd, currency)}
                              </span>

                              <button
                                type="button"
                                onClick={() => moveItemToCart(item.productId)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3.5 font-mono text-[10px] font-medium tracking-wider text-canvas transition-colors hover:bg-accent hover:text-accent-on"
                              >
                                Move to Bag →
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
