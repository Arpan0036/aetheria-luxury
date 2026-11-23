"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowDown, Check, Layers, Plus, Sparkles } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HERO_FINISHES, useHeroStore } from "@/store/useHeroStore";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct } from "@/types/database";

const Hero3DStage = dynamic(() => import("@/components/canvas/Hero3DStage"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Initializing AETHER-CORE 01 WebGL 2.0 stage"
      className="flex h-full w-full flex-col items-center justify-center rounded-[28px] border border-line bg-surface/65 p-8"
    >
      <div className="relative flex size-28 items-center justify-center rounded-full border border-line-strong bg-canvas">
        <span className="size-14 animate-pulse rounded-full bg-accent/25" />
        <span className="absolute inset-2 animate-spin rounded-full border border-dashed border-ink/35" />
      </div>
      <p className="mt-5 font-mono text-[10.5px] tracking-[0.2em] text-muted">
        INITIALIZING AETHER-CORE 01 // WEBGL 2.0 STAGE
      </p>
    </div>
  ),
});

export function HeroSection({ flagship }: { flagship: CatalogProduct }) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const currency = useUIStore((s) => s.activeCurrency);
  const theme = useUIStore((s) => s.theme);
  const addItem = useCartStore((s) => s.addItem);

  const finish = useHeroStore((s) => s.finish);
  const setFinish = useHeroStore((s) => s.setFinish);
  const isExploded = useHeroStore((s) => s.isExploded);
  const toggleExploded = useHeroStore((s) => s.toggleExploded);
  const setExploded = useHeroStore((s) => s.setExploded);
  const fps = useHeroStore((s) => s.fps);
  const setInView = useHeroStore((s) => s.setInView);

  const [added, setAdded] = useState(false);
  const manualToggleRef = useRef(false);

  const activeFinishSpec = HERO_FINISHES.find((f) => f.id === finish) ?? HERO_FINISHES[0];

  // 1. Viewport pause optimization: pause WebGL frameloop when scrolled far into catalog.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.02 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [setInView]);

  // 2. Scroll-choreographed exploded view when scrolling halfway down the hero (unless user toggled manually).
  useEffect(() => {
    const onScroll = () => {
      if (manualToggleRef.current) return;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = -rect.top / Math.max(1, rect.height);
      if (progress > 0.28 && progress < 0.85) {
        setExploded(true);
      } else if (progress <= 0.12) {
        setExploded(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setExploded]);

  const handleFlagshipAdd = () => {
    addItem(buildCartItemFromProduct(flagship), true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const formattedFlagshipPrice = formatPrice(flagship.price_usd, currency);

  return (
    <section
      ref={sectionRef}
      aria-label="AETHER-CORE 01 Spatial Acoustic Architecture"
      className="relative mx-auto min-h-[92vh] max-w-[1600px] px-5 pb-16 pt-6 md:px-8 md:pb-24 md:pt-10"
    >
      {/* Top Editorial Telemetry Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 font-mono text-[10.5px] tracking-[0.18em] text-muted">
        <span className="inline-flex items-center gap-2 text-ink">
          <span className="size-1.5 rounded-full bg-sage" aria-hidden />
          SERIES 01 // SPATIAL ACOUSTIC ARCHITECTURE [WEBGL 2.0 LIVE]
        </span>
        <span className="hidden sm:inline">
          LIGHTING: {theme === "daylight" ? "WARM DAYLIGHT 4800K" : "VELVET ESPRESSO RIM"}
        </span>
        <span className="tabular">
          AETHER-CORE 01 · {fps > 0 ? `${fps} FPS` : "60 FPS TARGET"} · DAY 04 / 14
        </span>
      </div>

      {/* Split / Layered Spatial Stage:
          - Mobile & Tablet (<1024px): 3D Stage stacked cleanly at top (h-[420px] sm:h-[500px]), controls & copy below (zero overlap).
          - Desktop (>=1024px): 12-column architectural split with foreground editorial overlay + expansive interactive 3D stage. */}
      <div className="grid grid-cols-1 items-center gap-8 lg:min-h-[78vh] lg:grid-cols-12 lg:gap-8">
        {/* 3D WebGL Sculpture Stage — top on mobile/tablet, right 7 columns on desktop */}
        <div className="relative order-1 h-[420px] w-full overflow-hidden rounded-[28px] border border-line bg-[radial-gradient(85%_75%_at_50%_42%,var(--bg-surface-strong),var(--bg-surface)_62%,var(--bg-canvas)_100%)] sm:h-[500px] lg:order-2 lg:col-span-7 lg:h-[740px]">
          {/* Subtle architectural crosshair grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] [background-size:64px_64px]"
          />

          {/* Top-left & Top-right HUD telemetry pills inside the stage */}
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em]">
            <span className="glass rounded-full border border-line px-3 py-1 text-ink">
              OBJECT: AETHER-CORE 01 // {activeFinishSpec.label.toUpperCase()}
            </span>
            <span
              className={cn(
                "glass rounded-full border px-3 py-1 transition-colors",
                isExploded ? "border-accent/50 text-accent" : "border-line text-muted",
              )}
            >
              {isExploded ? "STATE: EXPLODED ENGINEERING VIEW" : "STATE: ASSEMBLED MONOLITH"}
            </span>
          </div>

          <Hero3DStage />

          {/* Bottom stage interaction hint + mobile/desktop quick explode trigger */}
          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-2 font-mono text-[9.5px] tracking-[0.16em] text-muted">
            <span>DRAG OR MOVE CURSOR TO ORBIT · 5 SUB-ASSEMBLIES</span>
            <span className="hidden sm:inline">
              PBR METALNESS {activeFinishSpec.metalness.toFixed(2)} · ROUGHNESS {activeFinishSpec.roughness.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Left / Foreground Editorial Overlay (z-10, pointer-events-auto on controls) */}
        <div className="relative z-10 order-2 flex flex-col justify-between lg:order-1 lg:col-span-5">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sage/35 bg-surface/70 px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-sage">
              <Sparkles className="size-3" strokeWidth={1.75} />
              PROCEDURAL PBR ACOUSTIC SCULPTURE · 5 LAYERS
            </p>

            {/* LCP Headline — rendered visible immediately */}
            <h1 className="font-display text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.02] tracking-[-0.03em] text-ink">
              Sculpted Sound.{" "}
              <span className="block">
                Monolithic <em className="text-accent">Form.</em>
              </span>
            </h1>

            <p className="mt-5 max-w-[34rem] text-[15.5px] leading-[1.65] text-muted md:text-[16.5px]">
              Precision-milled from solid AL-6061 aluminum, honed Roman travertine, and frosted
              borosilicate glass. Inspect the internal 50mm beryllium transducer in real time or
              configure the exterior anodized finish below.
            </p>
          </div>

          {/* Interactive 3D Control Deck */}
          <div
            aria-label="3D Sculpture Interactive Control Deck"
            className="mt-7 rounded-[22px] border border-line bg-surface/85 p-5 shadow-[0_20px_50px_-30px_rgb(var(--shadow-tint)/0.4)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line pb-3 font-mono text-[10px] tracking-[0.18em] text-muted">
              <span>01 // REAL-TIME PBR FINISH SWITCHER</span>
              <span className="tabular text-ink">{activeFinishSpec.hex}</span>
            </div>

            {/* Finish Switcher Pills */}
            <div
              role="radiogroup"
              aria-label="Select 3D sculpture material finish"
              className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
            >
              {HERO_FINISHES.map((item) => {
                const active = item.id === finish;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFinish(item.id)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300",
                      active
                        ? "border-ink bg-ink text-canvas shadow-sm"
                        : "border-line-strong bg-canvas text-ink hover:border-ink",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-4 shrink-0 rounded-full border border-white/30 shadow-inner"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block font-mono text-[9px] tracking-[0.16em]",
                          active ? "text-canvas/70" : "text-muted",
                        )}
                      >
                        {item.index} / FINISH
                      </span>
                      <span className="block truncate text-[12px] font-medium">
                        {item.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explode Architecture Toggle Button */}
            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
                02 // SPATIAL ENGINEERING INSPECTION
              </span>
              <button
                type="button"
                aria-pressed={isExploded}
                onClick={() => {
                  manualToggleRef.current = true;
                  toggleExploded();
                }}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 font-mono text-[10.5px] font-medium tracking-[0.12em] transition-all duration-300",
                  isExploded
                    ? "border-accent bg-accent text-accent-on shadow-[0_10px_24px_-10px_var(--accent-primary)]"
                    : "border-line-strong bg-canvas text-ink hover:border-ink",
                )}
              >
                <Layers className="size-3.5" strokeWidth={1.75} />
                {isExploded ? "[ COLLAPSE ARCHITECTURE ]" : "[ EXPLODE ARCHITECTURE ]"}
              </button>
            </div>
          </div>

          {/* Primary Conversion Bar — Flagship Quick-Buy Card synced with live Supabase */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 rounded-[22px] border border-line bg-canvas p-4 shadow-[0_16px_40px_-28px_rgb(var(--shadow-tint)/0.35)]"
          >
            <div className="flex items-center gap-3.5">
              {flagship.images?.[0] && (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-[#EFECE6]">
                  <Image
                    src={flagship.images[0]}
                    alt={flagship.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 font-mono text-[9.5px] tracking-[0.16em] text-muted">
                  <span>FLAGSHIP OBJECT · {flagship.sku}</span>
                  <span className="text-sage">● IN STOCK ({flagship.stock_count})</span>
                </div>
                <p className="mt-0.5 truncate font-display text-[23px] leading-tight text-ink">
                  {flagship.title}
                </p>
                <p className="truncate text-[12px] text-muted">{flagship.tagline}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-line pt-3.5">
              <MagneticButton
                size="md"
                variant={added ? "surface" : "primary"}
                onClick={handleFlagshipAdd}
                className="flex-1"
              >
                {added ? (
                  <>
                    <Check className="size-4" strokeWidth={2} /> Added Flagship to Bag
                  </>
                ) : (
                  <>
                    <Plus className="size-4" strokeWidth={2} /> Add Flagship to Bag —{" "}
                    <span className="tabular font-mono">{formattedFlagshipPrice}</span>
                  </>
                )}
              </MagneticButton>

              <MagneticButton
                size="md"
                variant="outline"
                onClick={() => router.push("/shop")}
              >
                Explore 12 Objects <ArrowDown className="size-3.5" strokeWidth={1.75} />
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
