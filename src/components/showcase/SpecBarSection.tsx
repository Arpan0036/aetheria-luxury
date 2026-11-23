"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { CURRENCIES, cn } from "@/lib/utils";

const TOKENS = [
  { name: "--bg-canvas", cls: "bg-canvas" },
  { name: "--bg-surface", cls: "bg-surface" },
  { name: "--text-primary", cls: "bg-ink" },
  { name: "--text-muted", cls: "bg-muted" },
  { name: "--accent-primary", cls: "bg-accent" },
  { name: "--accent-secondary", cls: "bg-sage" },
];

const HEX: Record<"daylight" | "espresso", string[]> = {
  daylight: ["#F7F4EF", "#EFECE6", "#141413", "#65625D", "#C85632", "#2F5238"],
  espresso: ["#181615", "#221F1D", "#F3EFEA", "#9E9890", "#D47252", "#D4C3A3"],
};

const BREAKPOINTS = [
  { label: "Mobile", range: "< 768", min: 0 },
  { label: "Tablet", range: "768–1279", min: 768 },
  { label: "Laptop", range: "1280–1439", min: 1280 },
  { label: "Desktop", range: "≥ 1440", min: 1440 },
] as const;

function useViewport() {
  const [vp, setVp] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  return vp;
}

export function SpecBarSection() {
  const theme = useUIStore((s) => s.theme);
  const currency = useUIStore((s) => s.activeCurrency);
  const cartCount = useUIStore((s) => s.cartCount);
  const vp = useViewport();
  const active = vp ? [...BREAKPOINTS].reverse().find((b) => vp.w >= b.min)!.label : null;

  return (
    <section id="system" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <header className="mb-10 border-t border-line pt-6 md:mb-14">
        <p className="mb-4 font-mono text-[10.5px] tracking-[0.2em] text-muted">§ 03 — DESIGN SYSTEM & VIEWPORT SPEC</p>
        <h2 className="font-display text-[44px] text-ink sm:text-[60px] lg:text-[76px]">
          Warm Editorial <em className="text-accent">Luxury</em>, specified.
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
        {/* Tokens */}
        <div className="rounded-[22px] border border-line bg-surface p-6 md:col-span-6 lg:col-span-4">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-mono text-[10.5px] tracking-[0.18em] text-muted">ACTIVE THEME TOKENS</h3>
            <span className="font-display text-[26px] text-ink">
              {theme === "daylight" ? "Warm Daylight" : "Velvet Espresso"}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {TOKENS.map((t, i) => (
              <li key={t.name} className="rounded-2xl border border-line bg-canvas p-2.5">
                <span className={cn("block aspect-[4/3] rounded-xl border border-line transition-colors duration-500", t.cls)} />
                <p className="mt-3 truncate font-mono text-[10px] text-ink">{t.name}</p>
                <p className="tabular font-mono text-[10px] text-muted">{HEX[theme][i]}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Viewport */}
        <div className="flex flex-col justify-between rounded-[22px] bg-ink p-6 text-canvas md:col-span-3 lg:col-span-2">
          <h3 className="font-mono text-[10.5px] tracking-[0.18em] text-canvas/60">LIVE VIEWPORT</h3>
          <div className="my-6">
            <p className="font-display text-[56px] leading-none" aria-live="polite">{active ?? "—"}</p>
            <p className="tabular mt-2 font-mono text-[13px] text-canvas/70">
              {vp ? `${vp.w} × ${vp.h} PX` : "MEASURING…"}
            </p>
          </div>
          <ul className="grid grid-cols-4 gap-1.5">
            {BREAKPOINTS.map((b) => (
              <li
                key={b.label}
                className={cn(
                  "rounded-lg border px-1.5 py-2 text-center font-mono text-[9px] tracking-wider transition-colors",
                  active === b.label ? "border-accent bg-accent text-accent-on" : "border-canvas/15 text-canvas/55",
                )}
              >
                {b.label.toUpperCase()}
                <span className="mt-0.5 block text-[8px] opacity-70">{b.range}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Type specimens */}
        <div className="rounded-[22px] border border-line p-6 md:col-span-3 lg:col-span-3">
          <h3 className="mb-6 font-mono text-[10.5px] tracking-[0.18em] text-muted">TYPOGRAPHY SPECIMENS</h3>
          <p className="font-display text-[52px] text-ink">Quiet Objects</p>
          <p className="mt-4 max-w-[30rem] text-[15px] leading-relaxed text-muted">
            Plus Jakarta Sans carries interface and long-form copy with crisp geometric legibility at every size.
          </p>
          <p className="tabular mt-5 border-t border-line pt-4 font-mono text-[13px] text-ink">
            SKU AE-SA-003 · 0123456789 · {CURRENCIES[currency].symbol}1,240.00
          </p>
        </div>

        {/* State */}
        <div className="rounded-[22px] border border-line bg-surface p-6 md:col-span-6 lg:col-span-3">
          <h3 className="mb-6 font-mono text-[10.5px] tracking-[0.18em] text-muted">GLOBAL UI STORE — ZUSTAND</h3>
          <dl className="tabular grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line font-mono text-[12px]">
            {[
              ["theme", `'${theme}'`],
              ["activeCurrency", `'${currency}'`],
              ["cartCount", String(cartCount).padStart(2, "0")],
              ["search", "⌘/Ctrl + K"],
              ["scroll", "Lenis inertial"],
              ["motion", "Spring 150 / 15"],
            ].map(([k, v]) => (
              <div key={k} className="bg-canvas p-3.5">
                <dt className="text-[10px] text-muted">{k}</dt>
                <dd className="mt-1 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
