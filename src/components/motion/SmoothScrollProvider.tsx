"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";

let lenisInstance: Lenis | null = null;

/** Smooth-scroll to a target (falls back to native when Lenis is disabled). */
export function scrollToTarget(target: number | string | HTMLElement) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { duration: 1.6 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const hydrateTheme = useUIStore((s) => s.hydrateTheme);
  const toggleSearch = useUIStore((s) => s.toggleSearch);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const hydrateCart = useCartStore((s) => s.hydrateCart);
  const isWishlistOpen = useWishlistStore((s) => s.isOpen);
  const hydrateWishlist = useWishlistStore((s) => s.hydrateWishlist);
  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);

  const lockScroll = useUIStore(
    (s) =>
      s.isMobileMenuOpen ||
      s.isSearchOpen ||
      Boolean(s.quickInspectProduct) ||
      isCartOpen ||
      isWishlistOpen,
  );
  const scaleBack = useUIStore(
    (s) =>
      s.isSearchOpen ||
      Boolean(s.quickInspectProduct) ||
      isCartOpen ||
      isWishlistOpen,
  );

  // Re-apply stored theme + persisted cart/wishlist/auth before paint.
  useLayoutEffect(() => {
    hydrateTheme();
    hydrateCart();
    hydrateWishlist();
    hydrateAuth();
  }, [hydrateTheme, hydrateCart, hydrateWishlist, hydrateAuth]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // Pause inertial scroll while overlays are open.
  useEffect(() => {
    if (!lenisInstance) return;
    if (lockScroll) lenisInstance.stop();
    else lenisInstance.start();
  }, [lockScroll]);

  // Apply subtle 3D scale-back depth effect on <main> while Quick Inspect or Spotlight is open.
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    main.style.transition = "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), filter 450ms cubic-bezier(0.22, 1, 0.36, 1)";
    main.style.transformOrigin = "50% 22vh";
    if (scaleBack) {
      main.style.transform = "scale(0.965)";
    } else {
      main.style.transform = "";
    }
  }, [scaleBack]);

  // Global Cmd/Ctrl + K search shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSearch]);

  return <>{children}</>;
}
