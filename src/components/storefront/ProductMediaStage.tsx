"use client";

import { useState, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Box, Camera, Compass, Layers, Search, SunMedium } from "lucide-react";
import { useFinePointer } from "@/lib/hooks/useFinePointer";
import { cn } from "@/lib/utils";
import type { ProductDetail, ProductVariant } from "@/types/database";

const Product3DInspector = dynamic(() => import("@/components/canvas/Product3DInspector"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Initializing 3D WebGL Spatial Inspector"
      className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative flex size-24 items-center justify-center rounded-full border border-line-strong bg-canvas">
        <span className="size-12 animate-pulse rounded-full bg-accent/25" />
        <span className="absolute inset-2 animate-spin rounded-full border border-dashed border-ink/35" />
      </div>
      <p className="mt-4 font-mono text-[10.5px] tracking-[0.2em] text-muted">
        LOADING 3D WEBGL SPATIAL INSPECTOR…
      </p>
    </div>
  ),
});

type StageMode = "studio" | "webgl";
type AngleId = "three-quarter" | "macro-crop" | "blueprint";

const ANGLES: { id: AngleId; index: string; label: string; badge: string }[] = [
  {
    id: "three-quarter",
    index: "01",
    label: "Studio Three-Quarter",
    badge: "01 / STUDIO THREE-QUARTER",
  },
  {
    id: "macro-crop",
    index: "02",
    label: "Macro Material Detail Crop",
    badge: "02 / MACRO MATERIAL DETAIL CROP",
  },
  {
    id: "blueprint",
    index: "03",
    label: "Architectural Scale & Blueprint",
    badge: "03 / ARCHITECTURAL SCALE & BLUEPRINT",
  },
];

export function ProductMediaStage({
  product,
  activeVariant,
}: {
  product: ProductDetail;
  activeVariant: ProductVariant;
}) {
  const finePointer = useFinePointer();
  const [mode, setMode] = useState<StageMode>("studio");
  const [angle, setAngle] = useState<AngleId>("three-quarter");
  const [isExploded, setIsExploded] = useState(false);
  const [lightingMode, setLightingMode] = useState<"studio" | "espresso">("studio");

  const [loupe, setLoupe] = useState<{ active: boolean; xPct: number; yPct: number }>({
    active: false,
    xPct: 50,
    yPct: 50,
  });

  const primaryImage = product.images?.[0] ?? "/images/products/aether-01-headphones.png";
  const activeAngleMeta = ANGLES.find((a) => a.id === angle) ?? ANGLES[0];

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!finePointer || e.pointerType !== "mouse" || mode !== "studio") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setLoupe({ active: true, xPct, yPct });
  };

  const onPointerLeave = () => {
    setLoupe((prev) => ({ ...prev, active: false }));
  };

  return (
    <div className="space-y-4">
      {/* Top Floating Glassmorphic Mode Switcher */}
      <LayoutGroup id="pdp-stage-mode">
        <div
          role="tablist"
          aria-label="Product media inspection mode"
          className="grid grid-cols-1 gap-2 rounded-2xl border border-line bg-surface p-1.5 sm:grid-cols-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "studio"}
            onClick={() => setMode("studio")}
            className={cn(
              "relative inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 font-mono text-[10.5px] font-medium tracking-[0.13em] transition-colors",
              mode === "studio" ? "text-canvas" : "text-muted hover:text-ink",
            )}
          >
            {mode === "studio" && (
              <motion.span
                layoutId="pdp-mode-pill"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-ink"
              />
            )}
            <Camera className="relative z-10 size-3.5" strokeWidth={1.75} />
            <span className="relative z-10">[ 01 // STUDIO PHOTOGRAPHY + LOUPE ]</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "webgl"}
            onClick={() => setMode("webgl")}
            className={cn(
              "relative inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 font-mono text-[10.5px] font-medium tracking-[0.13em] transition-colors",
              mode === "webgl" ? "text-canvas" : "text-muted hover:text-ink",
            )}
          >
            {mode === "webgl" && (
              <motion.span
                layoutId="pdp-mode-pill"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-ink"
              />
            )}
            <Box className="relative z-10 size-3.5" strokeWidth={1.75} />
            <span className="relative z-10">[ 02 // 3D WEBGL SPATIAL INSPECTOR ]</span>
          </button>
        </div>
      </LayoutGroup>

      {/* Main Architectural Stage Container (aspect-[4/5]) */}
      <div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={cn(
          "relative aspect-[4/5] w-full overflow-hidden rounded-[26px] border border-line shadow-[0_36px_80px_-40px_rgb(var(--shadow-tint)/0.5)]",
          mode === "studio"
            ? "cursor-crosshair bg-[#EFECE6]"
            : lightingMode === "studio"
              ? "bg-[radial-gradient(85%_75%_at_50%_42%,var(--bg-surface-strong),var(--bg-surface)_65%,var(--bg-canvas)_100%)]"
              : "bg-[radial-gradient(85%_75%_at_50%_42%,#2C2623,#1E1B19_65%,#141312_100%)]",
        )}
      >
        {mode === "studio" ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={angle}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  scale: angle === "macro-crop" ? 1.52 : 1,
                }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-full w-full"
              >
                <Image
                  src={primaryImage}
                  alt={`${product.title} — ${activeVariant.variant_name} (${activeAngleMeta.label})`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className={cn(
                    "object-cover transition-transform duration-700",
                    angle === "macro-crop" && "origin-[52%_44%]",
                  )}
                />
              </motion.div>
            </AnimatePresence>

            {/* Angle 03: Architectural Scale & Dimension Blueprint Overlay */}
            {angle === "blueprint" && (
              <div
                aria-label="Architectural scale and dimension blueprint overlay"
                className="pointer-events-none absolute inset-0 z-10 bg-[#141413]/35 backdrop-blur-[1.5px]"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-65 [background-image:linear-gradient(to_right,rgba(247,244,239,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(247,244,239,0.22)_1px,transparent_1px)] [background-size:44px_44px]"
                />
                <svg
                  aria-hidden
                  viewBox="0 0 100 125"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full"
                >
                  <g
                    stroke="#F7F4EF"
                    strokeOpacity="0.8"
                    strokeWidth="0.3"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  >
                    <line x1="14" y1="18" x2="86" y2="18" strokeDasharray="2 1.5" />
                    <line x1="14" y1="15" x2="14" y2="21" />
                    <line x1="86" y1="15" x2="86" y2="21" />
                    <line x1="18" y1="24" x2="18" y2="104" strokeDasharray="2 1.5" />
                    <line x1="15" y1="24" x2="21" y2="24" />
                    <line x1="15" y1="104" x2="21" y2="104" />
                    <circle cx="50" cy="62.5" r="16" />
                    <circle cx="50" cy="62.5" r="1.4" fill="#C85632" />
                  </g>
                </svg>

                <div className="absolute inset-x-6 top-16 flex justify-center">
                  <span className="rounded-full border border-[#F7F4EF]/40 bg-[#141413]/80 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[#F7F4EF]">
                    DIM // {product.dimensions}
                  </span>
                </div>
                <div className="absolute bottom-20 left-6 flex flex-col gap-1.5">
                  <span className="rounded-full border border-[#F7F4EF]/40 bg-[#141413]/80 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[#F7F4EF]">
                    MASS // {product.weight}
                  </span>
                  <span className="rounded-full border border-[#F7F4EF]/40 bg-[#141413]/80 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[#F7F4EF]">
                    CHASSIS // {product.materials[0]?.toUpperCase() ?? "CNC AL-6061"}
                  </span>
                </div>
              </div>
            )}

            {/* Top Studio HUD */}
            <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2 font-mono text-[9.5px] tracking-[0.16em]">
              <span className="glass rounded-full border border-line px-3 py-1 text-ink">
                {activeAngleMeta.badge}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141413]/80 px-3 py-1 text-[#F7F4EF] backdrop-blur-md">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full border border-white/40"
                  style={{ backgroundColor: activeVariant.color_hex }}
                />
                {activeVariant.variant_name.toUpperCase()}
              </span>
            </div>

            {/* Bottom Studio Loupe Hint */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-center justify-between font-mono text-[9.5px] tracking-[0.16em] text-[#F7F4EF]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141413]/75 px-3 py-1 backdrop-blur-md">
                <Search className="size-3 text-accent" strokeWidth={1.75} />
                HOVER FOR 2.2× OPTICAL LOUPE
              </span>
              <span className="rounded-full bg-[#141413]/75 px-3 py-1 backdrop-blur-md">
                {activeVariant.sku}
              </span>
            </div>

            {/* 2.2x Optical Magnifier Loupe (Desktop cursor-tracked) */}
            {finePointer && loupe.active && (
              <div
                aria-hidden
                style={{
                  left: `${loupe.xPct}%`,
                  top: `${loupe.yPct}%`,
                  backgroundImage: `url(${primaryImage})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "220%",
                  backgroundPosition: `${loupe.xPct}% ${loupe.yPct}%`,
                }}
                className="pointer-events-none absolute z-30 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F7F4EF] shadow-[0_24px_50px_-12px_rgba(20,20,19,0.65)] ring-1 ring-[#141413]/25"
              >
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#141413]/85 px-2 py-0.5 font-mono text-[8.5px] tracking-[0.18em] text-[#F7F4EF]">
                  2.2× LOUPE
                </span>
              </div>
            )}
          </>
        ) : (
          /* Mode B: 3D WebGL Spatial Inspector */
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] [background-size:52px_52px]"
            />

            {/* Top 3D Stage Telemetry */}
            <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2 font-mono text-[9.5px] tracking-[0.16em]">
              <span className="glass rounded-full border border-line px-3 py-1 text-ink">
                WEBGL 2.0 // {product.category.name.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141413]/80 px-3 py-1 text-[#F7F4EF] backdrop-blur-md">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full border border-white/40"
                  style={{ backgroundColor: activeVariant.color_hex }}
                />
                SHADER: {activeVariant.variant_name.toUpperCase()} ({activeVariant.color_hex})
              </span>
            </div>

            <Product3DInspector
              categorySlug={product.category_slug}
              threeDConfig={product.three_d_config}
              variantHex={activeVariant.color_hex}
              variantName={activeVariant.variant_name}
              isExploded={isExploded}
              lightingMode={lightingMode}
            />

            {/* Interactive 3D Controls HUD (Bottom) */}
            <div className="absolute inset-x-4 bottom-4 z-20 flex flex-wrap items-center justify-between gap-2">
              <span className="glass inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[9.5px] tracking-[0.15em] text-ink">
                <Compass className="size-3 text-accent" strokeWidth={1.75} />
                DRAG TO ORBIT 360°
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={isExploded}
                  onClick={() => setIsExploded((v) => !v)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 font-mono text-[9.5px] font-medium tracking-[0.14em] transition-colors",
                    isExploded
                      ? "border-accent bg-accent text-accent-on"
                      : "glass border-line-strong text-ink hover:border-ink",
                  )}
                >
                  <Layers className="size-3" strokeWidth={1.75} />
                  {isExploded ? "[ COLLAPSE LAYER ]" : "[ EXPLODE LAYER ]"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setLightingMode((m) => (m === "studio" ? "espresso" : "studio"))
                  }
                  className="glass inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3.5 font-mono text-[9.5px] font-medium tracking-[0.14em] text-ink transition-colors hover:border-ink"
                >
                  <SunMedium className="size-3 text-accent" strokeWidth={1.75} />
                  {lightingMode === "studio" ? "LIGHT: STUDIO 4800K" : "LIGHT: ESPRESSO RIM"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Multi-Angle Editorial Thumbnails (3 Distinct Framing Views) */}
      <div
        role="group"
        aria-label="Select studio framing view"
        className="grid grid-cols-3 gap-3"
      >
        {ANGLES.map((item) => {
          const selected = mode === "studio" && angle === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setMode("studio");
                setAngle(item.id);
              }}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[18px] border p-2 text-left transition-all",
                selected
                  ? "border-ink bg-surface ring-2 ring-ink/15"
                  : "border-line bg-surface/60 hover:border-line-strong",
              )}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#EFECE6]">
                <Image
                  src={primaryImage}
                  alt={`${product.title} — ${item.label}`}
                  fill
                  sizes="180px"
                  className={cn(
                    "object-cover transition-transform duration-500",
                    item.id === "macro-crop" && "scale-150 origin-[52%_44%]",
                    item.id === "blueprint" && "brightness-75 contrast-125",
                  )}
                />
                {item.id === "blueprint" && (
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-75 [background-image:linear-gradient(to_right,rgba(247,244,239,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(247,244,239,0.35)_1px,transparent_1px)] [background-size:14px_14px]"
                  />
                )}
              </div>
              <div className="mt-2 px-1">
                <p className="font-mono text-[9px] tracking-[0.16em] text-muted">
                  VIEW {item.index}
                </p>
                <p className="truncate text-[11.5px] font-medium text-ink">{item.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
