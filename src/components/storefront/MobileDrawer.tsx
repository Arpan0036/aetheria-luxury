"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { CurrencySelector, ThemeSwitcher } from "./Controls";

const LINKS = [
  { label: "Shop All", href: "/shop", index: "01", note: "12 objects" },
  { label: "Spatial Audio", href: "/shop?category=spatial-audio", index: "02", note: "03 objects" },
  { label: "Desk Architecture", href: "/shop?category=desk-architecture", index: "03", note: "04 objects" },
  { label: "Editorial", href: "/about", index: "04", note: "Manifesto" },
  { label: "Collector Vault", href: "/account", index: "05", note: "3D Pass" },
];

const SUPPORT = [
  { label: "Client Concierge", href: "/contact" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Track Order", href: "/order/latest" },
  { label: "Privacy & Terms", href: "/privacy" },
];

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
};
const item: Variants = {
  hidden: { opacity: 0, x: -24, filter: "blur(4px)" },
  show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Modal <dialog> drawer with native scroll-snap swipe-to-dismiss
 * (pattern: modern-web-guidance "navigation-drawer"), plus Framer Motion
 * staggered link reveals.
 */
export function MobileDrawer() {
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setOpen = useUIStore((s) => s.setMobileMenuOpen);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  const closeDrawer = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // Slide out; the IntersectionObserver closes the dialog once the sheet is gone.
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: "auto" });
  }, []);

  // Open when the store says so.
  useEffect(() => {
    const dialog = dialogRef.current;
    const scroller = scrollerRef.current;
    if (!dialog || !scroller) return;
    if (isOpen && !dialog.open) {
      let cancelled = false;
      (async () => {
        dialog.showModal();
        if (!CSS.supports("scroll-initial-target", "nearest")) {
          scroller.scrollTo({ left: scroller.offsetWidth, behavior: "instant" });
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        }
        if (!cancelled) {
          scroller.scrollTo({ left: 0, behavior: "auto" });
          setRevealed(true);
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    if (!isOpen && dialog.open) closeDrawer();
  }, [isOpen, closeDrawer]);

  // Observer = single source of truth for open/closed (swipe, tap-out, Esc, button).
  useEffect(() => {
    const dialog = dialogRef.current;
    const sheet = sheetRef.current;
    const scroller = scrollerRef.current;
    if (!dialog || !sheet || !scroller) return;
    const visibleThreshold = 1 / window.innerWidth;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry || !dialog.open) return;
        if (entry.intersectionRatio < visibleThreshold) {
          dialog.close();
          setRevealed(false);
          setOpen(false);
        }
      },
      { root: dialog, threshold: [visibleThreshold, 1] },
    );
    io.observe(sheet);

    let onScroll: (() => void) | undefined;
    if (!CSS.supports("animation-timeline: scroll()")) {
      onScroll = () => {
        const ratio = 1 - scroller.scrollLeft / sheet.offsetWidth;
        dialog.style.setProperty("--drawer-backdrop", String(Math.max(0, Math.min(1, ratio))));
      };
      scroller.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      io.disconnect();
      if (onScroll) scroller.removeEventListener("scroll", onScroll);
    };
  }, [setOpen]);

  // Close on desktop resize so the modal never lingers.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && closeDrawer();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeDrawer]);

  return (
    <dialog
      ref={dialogRef}
      id="mobile-drawer"
      className="Drawer"
      aria-label="Site navigation"
      data-lenis-prevent
      onClick={(e) => {
        if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) closeDrawer();
      }}
      onCancel={(e) => {
        if (e.cancelable) {
          e.preventDefault();
          closeDrawer();
        }
      }}
    >
      <div ref={scrollerRef} className="Drawer-scroller">
        <nav ref={sheetRef} className="Drawer-sheet" aria-label="Mobile">
          {/* Head */}
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="leading-none">
              <p className="font-display text-[24px]">AETHERIA®</p>
              <p className="mt-1 font-mono text-[8.5px] tracking-[0.22em] text-muted">EST. 2026 // OBJECTS</p>
            </div>
            <button
              onClick={closeDrawer}
              aria-label="Close menu"
              autoFocus
              className="inline-flex size-12 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Links */}
          <motion.ul
            variants={list}
            initial="hidden"
            animate={revealed ? "show" : "hidden"}
            className="flex flex-col px-5 pt-6"
          >
            {LINKS.map((l) => (
              <motion.li key={l.label} variants={item} className="border-b border-line">
                <Link
                  href={l.href}
                  onClick={closeDrawer}
                  className="group flex min-h-16 items-center justify-between gap-4 py-4"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] text-muted">{l.index}</span>
                    <span className="font-display text-[34px] transition-colors group-hover:text-accent">{l.label}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{l.note}</span>
                </Link>
              </motion.li>
            ))}
            <motion.li variants={item} className="pt-7">
              <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-muted">CURRENCY</p>
              <CurrencySelector className="rounded-full border border-line p-1" />
            </motion.li>
            <motion.li variants={item} className="pt-5">
              <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-muted">ATMOSPHERE</p>
              <ThemeSwitcher className="rounded-full border border-line p-1" />
            </motion.li>
          </motion.ul>

          {/* Support */}
          <motion.div
            variants={list}
            initial="hidden"
            animate={revealed ? "show" : "hidden"}
            className="mt-8 border-t border-line bg-surface px-5 py-6"
          >
            <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-muted">QUICK SUPPORT</p>
            <ul className="grid grid-cols-2 gap-x-4">
              {SUPPORT.map((s) => (
                <motion.li key={s.label} variants={item}>
                  <Link
                    href={s.href}
                    onClick={closeDrawer}
                    className="flex min-h-11 items-center gap-1 text-[13px] text-ink hover:text-accent"
                  >
                    {s.label}
                    <ArrowUpRight className="size-3.5 text-muted" strokeWidth={1.5} />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </nav>
      </div>
    </dialog>
  );
}
