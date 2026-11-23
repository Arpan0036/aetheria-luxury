"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { Heart, Menu, Search, User } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CurrencySelector, ThemeSwitcher } from "./Controls";
import { MobileDrawer } from "./MobileDrawer";
import { SpotlightSearchModal } from "./SpotlightSearchModal";
import { QuickInspectModal } from "./QuickInspectModal";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/database";

export const NAV_LINKS = [
  { label: "Shop All", href: "/shop", index: "01" },
  { label: "Spatial Audio", href: "/shop?category=spatial-audio", index: "02" },
  { label: "Desk Architecture", href: "/shop?category=desk-architecture", index: "03" },
  { label: "Editorial", href: "/about", index: "04" },
];

const TICKER = "COMPLIMENTARY EXPRESS SHIPPING ON US, UK & EU ORDERS OVER $150";

function UtilityBar() {
  return (
    <div className="relative z-50 bg-ink text-canvas">
      <div className="mx-auto flex h-9 max-w-[1600px] items-center gap-6 px-4 md:px-8">
        {/* Ticker — marquee on small screens, static on desktop */}
        <div className="relative min-w-0 flex-1 overflow-hidden lg:overflow-visible">
          <div className="flex w-max animate-ticker gap-12 font-mono text-[10.5px] tracking-[0.14em] lg:w-auto lg:animate-none">
            <span className="whitespace-nowrap">
              <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-accent" aria-hidden />
              {TICKER}
            </span>
            <span className="whitespace-nowrap lg:hidden" aria-hidden>
              <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-accent" />
              {TICKER}
            </span>
          </div>
        </div>
        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/contact"
            className="font-mono text-[10px] tracking-[0.16em] text-canvas/80 transition-colors hover:text-accent"
          >
            CONCIERGE
          </Link>
          <span className="h-3.5 w-px bg-canvas/20" aria-hidden />
          <Link
            href="/order/latest"
            className="font-mono text-[10px] tracking-[0.16em] text-canvas/80 transition-colors hover:text-accent"
          >
            TRACK ORDER
          </Link>
          <span className="h-3.5 w-px bg-canvas/20" aria-hidden />
          <CurrencySelector tone="inverse" />
          <span className="h-3.5 w-px bg-canvas/20" aria-hidden />
          <ThemeSwitcher tone="inverse" />
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function AccountPill() {
  const profile = useAuthStore((s) => s.profile);
  const initials = profile ? getInitials(profile.full_name) : null;
  const isAdmin = profile?.role === "admin";

  return (
    <div className="inline-flex items-center gap-1.5">
      {isAdmin && (
        <Link
          href="/admin"
          data-testid="navbar-admin-studio-link"
          className="hidden h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-accent bg-accent px-3 font-mono text-[10px] font-semibold tracking-[0.14em] text-accent-on shadow-sm transition-colors hover:bg-accent-hover md:inline-flex md:h-11 md:px-3.5"
        >
          <span>[ ADMIN STUDIO ]</span>
        </Link>
      )}
      <Link
        href="/account"
        data-testid="navbar-account-trigger"
        aria-label={
          profile
            ? `Collector Sanctuary (${profile.full_name}, ${profile.role})`
            : "Sign in to Collector Sanctuary"
        }
        className={cn(
          "relative inline-flex h-10 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[10.5px] font-medium tracking-[0.13em] transition-colors sm:h-11 sm:px-3.5",
          profile
            ? isAdmin
              ? "border-accent/60 bg-accent/12 text-accent hover:bg-accent hover:text-accent-on"
              : "border-sage/50 bg-surface text-ink hover:border-ink"
            : "border-line bg-surface/65 text-ink hover:border-line-strong hover:text-accent",
        )}
      >
        {profile ? (
          <>
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                isAdmin ? "bg-accent" : "bg-sage",
              )}
            />
            <span>[{initials}]</span>
          </>
        ) : (
          <>
            <User className="size-[15px] sm:hidden" strokeWidth={1.6} />
            <span className="hidden sm:inline">[ Sign In ]</span>
          </>
        )}
      </Link>
    </div>
  );
}

function WishlistPill() {
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const setWishlistOpen = useWishlistStore((s) => s.setOpen);

  return (
    <button
      type="button"
      onClick={() => setWishlistOpen(true)}
      aria-label={`Wishlist, ${wishlistCount} saved objects`}
      className="relative inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface/65 px-2.5 text-ink transition-colors hover:border-line-strong hover:text-accent sm:h-11 sm:px-3"
    >
      <Heart
        className={cn("size-[16px] sm:size-[17px]", wishlistCount > 0 && "fill-accent text-accent")}
        strokeWidth={1.6}
      />
      <span className="tabular hidden font-mono text-[11px] font-medium sm:inline">
        [{String(wishlistCount).padStart(2, "0")}]
      </span>
    </button>
  );
}

function BagPill() {
  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const pulse = useUIStore((s) => s.cartPulse);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const label = count.toString().padStart(2, "0");
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!pulse || !scope.current) return;
    animate(scope.current, { scale: [0.9, 1.06, 1] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
  }, [pulse, animate, scope]);

  return (
    <button
      ref={scope}
      type="button"
      onClick={() => setCartOpen(true)}
      aria-label={`Bag, ${count} items. Click to open collector bag.`}
      className="relative inline-flex h-9 items-center gap-1 rounded-full bg-ink pl-2.5 pr-1 text-canvas transition-colors hover:bg-accent hover:text-accent-on sm:h-11 sm:gap-2 sm:pl-4 sm:pr-1.5"
    >
      <span className="text-[11.5px] font-medium sm:text-[13px]">Bag</span>
      <span className="relative inline-flex h-7 min-w-8 items-center justify-center overflow-hidden rounded-full bg-canvas/12 px-1 font-mono text-[10.5px] sm:h-8 sm:min-w-11 sm:px-2 sm:text-[12px]">
        <span aria-hidden className="text-canvas/50">[</span>
        <span className="relative inline-block h-[1.1em] w-[2ch] overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={label}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 leading-[1.1em] tabular"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
        <span aria-hidden className="text-canvas/50">]</span>
      </span>
      {pulse > 0 && (
        <motion.span
          key={`ring-${pulse}`}
          aria-hidden
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-full border border-accent"
        />
      )}
    </button>
  );
}

export function Navbar({ products }: { products?: CatalogProduct[] }) {
  const setMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const isMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <UtilityBar />
      <div ref={sentinel} aria-hidden className="h-px" />
      <header
        className={cn(
          "glass sticky top-0 z-40 border-b transition-[border-color,box-shadow] duration-500",
          scrolled ? "border-line shadow-[0_12px_40px_-28px_rgb(var(--shadow-tint)/0.35)]" : "border-transparent",
        )}
      >
        <div className="mx-auto grid h-[68px] max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-1 px-2 md:grid-cols-[1fr_auto_1fr] md:gap-3 md:h-20 md:px-8">
          {/* Left zone */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-drawer"
              className="inline-flex size-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {NAV_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="group relative inline-flex items-baseline gap-1.5 py-2 text-[13.5px] font-medium text-ink"
                    >
                      <span className="font-mono text-[9.5px] text-muted transition-colors group-hover:text-accent">{l.index}</span>
                      {l.label}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-1 h-px origin-right scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:origin-left group-hover:scale-x-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Center wordmark */}
          <Link href="/" aria-label="AETHERIA home" className="flex flex-col items-center leading-none">
            <span className="font-display text-[22px] sm:text-[26px] md:text-[34px]">
              AETHERIA<sup className="ml-0.5 align-super font-sans text-[8.5px] md:text-[10px]">®</sup>
            </span>
            <span className="mt-1 hidden font-mono text-[8.5px] tracking-[0.22em] text-muted sm:block md:text-[9px]">EST. 2026 // OBJECTS</span>
          </Link>

          {/* Right zone */}
          <div className="flex items-center justify-end gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (Command K)"
              aria-keyshortcuts="Meta+K Control+K"
              className="hidden h-11 items-center gap-3 rounded-full border border-line bg-surface/60 pl-4 pr-1.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-ink md:inline-flex"
            >
              <Search className="size-4" strokeWidth={1.5} />
              <span className="hidden xl:inline">Search objects</span>
              <kbd className="rounded-full border border-line bg-canvas px-2 py-1 font-mono text-[10.5px] text-ink">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="inline-flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface md:hidden"
            >
              <Search className="size-[16px]" strokeWidth={1.5} />
            </button>
            <AccountPill />
            <WishlistPill />
            <BagPill />
          </div>
        </div>
      </header>
      <MobileDrawer />
      <SpotlightSearchModal products={products} />
      <QuickInspectModal />
      <CartDrawer products={products} />
      <WishlistDrawer />
    </>
  );
}
