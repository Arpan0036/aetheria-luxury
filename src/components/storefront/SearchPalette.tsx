"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { SEED_PRODUCTS } from "@/lib/supabase/fallback-data";
import { scrollToTarget } from "@/components/motion/SmoothScrollProvider";

const SUGGESTIONS = SEED_PRODUCTS.map((p) => ({
  label: p.title,
  meta: p.tagline.toUpperCase(),
  sku: p.sku,
}));

/** Cmd/Ctrl + K command palette — a native modal <dialog>. Full search lands in a later phase. */
export function SearchPalette() {
  const isOpen = useUIStore((s) => s.isSearchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  const results = SUGGESTIONS.filter(
    (s) =>
      s.label.toLowerCase().includes(q.trim().toLowerCase()) ||
      s.sku.toLowerCase().includes(q.trim().toLowerCase()),
  ).slice(0, 6);

  return (
    <dialog
      ref={ref}
      className="Palette"
      aria-label="Search the archive"
      data-lenis-prevent
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === ref.current) setOpen(false);
      }}
    >
      <form method="dialog" role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3 border-b border-line px-5">
        <Search aria-hidden className="size-5 shrink-0 text-muted" strokeWidth={1.5} />
        <label htmlFor="palette-q" className="sr-only">Search objects</label>
        <input
          id="palette-q"
          type="search"
          autoFocus
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search objects, collections, journal…"
          className="h-16 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
        />
        <kbd className="rounded-md border border-line px-2 py-1 font-mono text-[10px] text-muted">ESC</kbd>
      </form>
      <div className="p-2">
        <p className="px-3 pb-2 pt-3 font-mono text-[10px] tracking-[0.18em] text-muted">
          {q ? `${results.length} RESULTS` : "CURATED SUGGESTIONS"}
        </p>
        <ul>
          {results.map((r) => (
            <li key={r.sku}>
              <button
                onClick={() => {
                  setOpen(false);
                  scrollToTarget("#objects");
                }}
                className="group flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface focus-visible:bg-surface"
              >
                <span>
                  <span className="block text-[15px] text-ink">{r.label}</span>
                  <span className="font-mono text-[10px] tracking-wider text-muted">{r.meta} · {r.sku}</span>
                </span>
                <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" strokeWidth={1.5} />
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-6 text-[14px] text-muted">Nothing in the archive matches “{q}”.</li>
          )}
        </ul>
      </div>
    </dialog>
  );
}
