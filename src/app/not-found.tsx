"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass, Search } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { MagneticButton } from "@/components/motion/MagneticButton";

export default function NotFound() {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-[1440px] flex-col justify-center px-5 py-20 md:px-8">
      <div className="rounded-[32px] border border-line-strong bg-surface p-8 shadow-[0_28px_70px_-34px_rgb(var(--shadow-tint)/0.28)] sm:p-14 lg:p-20">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <span
            data-testid="not-found-badge"
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 font-mono text-[10.5px] font-semibold tracking-[0.2em] text-accent"
          >
            <Compass className="size-3.5" />
            404 {"//"} COORDINATE NOT FOUND IN ARCHIVE
          </span>
          <span className="font-mono text-[10.5px] tracking-[0.18em] text-muted">
            STATUS: UNASSIGNED VAULT SECTOR
          </span>
        </div>

        <div className="mt-10 max-w-3xl">
          <h1 className="font-display text-[44px] leading-[1.03] text-ink sm:text-[62px] lg:text-[78px]">
            This Archive Coordinate Does Not{" "}
            <em className="font-normal italic text-accent">Exist.</em>
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
            The serialized route or object reference you requested has either been retired from our
            Zurich and Copenhagen catalog ledger or entered with an invalid slug. Use our global
            Spotlight index or return to the main collection below.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/">
            <MagneticButton size="lg">
              <ArrowLeft className="size-4" strokeWidth={1.75} />
              Return to Storefront
            </MagneticButton>
          </Link>

          <Link
            href="/shop"
            className="inline-flex h-13 items-center gap-2 rounded-full border border-line-strong bg-canvas px-6 font-mono text-[11px] font-medium tracking-[0.16em] text-ink transition-colors hover:border-ink"
          >
            Browse Full Archive (/shop)
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-13 items-center gap-2.5 rounded-full border border-line-strong bg-canvas px-6 font-mono text-[11px] font-medium tracking-[0.16em] text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <Search className="size-4" strokeWidth={1.75} />
            Open Cmd+K Search
          </button>
        </div>
      </div>
    </div>
  );
}
