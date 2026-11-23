"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { Tilt3DCard } from "@/components/motion/Tilt3DCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useUIStore } from "@/store/useUIStore";
import { formatPrice } from "@/lib/utils";
import { ObjectRender, type ObjectKind } from "./ObjectRender";

interface Product {
  sku: string;
  name: string;
  collection: string;
  material: string;
  priceUsd: number;
  kind: ObjectKind;
  edition: string;
  stock: "In Stock" | "Low Stock" | "Pre-Order";
}

const PRODUCTS: Product[] = [
  { sku: "AE-SA-003", name: "Orb Speaker No. 3", collection: "Spatial Audio", material: "Terracotta ceramic · brass", priceUsd: 1240, kind: "orb", edition: "Nº 041/300", stock: "In Stock" },
  { sku: "AE-SA-009", name: "Monolith Column", collection: "Spatial Audio", material: "Basalt-black anodised alloy", priceUsd: 2890, kind: "monolith", edition: "Nº 007/120", stock: "Low Stock" },
  { sku: "AE-DA-011", name: "Plinth Desk Lamp", collection: "Desk Architecture", material: "Travertine · lacquered steel", priceUsd: 680, kind: "lamp", edition: "OPEN EDITION", stock: "In Stock" },
  { sku: "AE-SA-017", name: "Field Recorder OB-1", collection: "Spatial Audio", material: "Bead-blasted aluminium", priceUsd: 1490, kind: "recorder", edition: "Nº 112/500", stock: "Pre-Order" },
  { sku: "AE-DA-020", name: "Halo Monitor Ring", collection: "Desk Architecture", material: "Champagne brushed brass", priceUsd: 420, kind: "ring", edition: "OPEN EDITION", stock: "In Stock" },
  { sku: "AE-DA-024", name: "Sage Valet Tray", collection: "Desk Architecture", material: "Hand-glazed stoneware", priceUsd: 165, kind: "tray", edition: "Nº 230/800", stock: "In Stock" },
];

function ProductCard({ p, index }: { p: Product; index: number }) {
  const currency = useUIStore((s) => s.activeCurrency);
  const addToCart = useUIStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    addToCart(1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const stockCls =
    p.stock === "In Stock"
      ? "border-sage/40 text-sage"
      : p.stock === "Low Stock"
        ? "border-accent/40 text-accent"
        : "border-line-strong text-muted";

  return (
    <motion.li
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt3DCard className="h-full">
        <article className="flex h-full flex-col p-3">
          {/* Stage */}
          <div className="relative aspect-[4/3.6] overflow-hidden rounded-[16px] bg-canvas [transform-style:preserve-3d]">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,var(--bg-surface-strong),transparent_70%)]" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[30%] border-t border-line bg-surface/60" />
            <div role="img" aria-label={`${p.name} — ${p.material}`} className="absolute inset-0">
              <ObjectRender kind={p.kind} />
            </div>
            {/* Floating Z-axis badges */}
            <span className={`absolute left-3 top-3 rounded-full border bg-glass px-2.5 py-1 font-mono text-[10px] tracking-wider glass [transform:translateZ(36px)] ${stockCls}`}>
              ● {p.stock.toUpperCase()}
            </span>
            <span className="absolute right-3 top-3 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] tracking-wider text-canvas [transform:translateZ(48px)]">
              {p.edition}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.16em] text-muted">
                  {String(index + 1).padStart(2, "0")} — {p.collection.toUpperCase()}
                </p>
                <h3 className="mt-2 font-display text-[30px] text-ink">{p.name}</h3>
                <p className="mt-1 text-[13px] text-muted">{p.material}</p>
              </div>
              <div className="shrink-0 text-right">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={currency}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="tabular font-mono text-[17px] text-ink"
                  >
                    {formatPrice(p.priceUsd, currency)}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-1 font-mono text-[10px] tracking-wider text-muted">{p.sku}</p>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 pt-6">
              <span className="font-mono text-[10px] tracking-wider text-muted">DUTIES INCL. · 2-YR CARE</span>
              <MagneticButton size="sm" variant={added ? "surface" : "primary"} onClick={onAdd} aria-label={`Test add ${p.name} to bag`}>
                {added ? (
                  <>
                    <Check className="size-3.5" strokeWidth={2} /> Added
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" strokeWidth={2} /> Test Add to Bag
                  </>
                )}
              </MagneticButton>
            </div>
          </div>
        </article>
      </Tilt3DCard>
    </motion.li>
  );
}

export function TiltGridSection() {
  return (
    <section id="objects" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <header className="mb-10 grid gap-6 border-t border-line pt-6 md:mb-14 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-4 font-mono text-[10.5px] tracking-[0.2em] text-muted">§ 02 — 3D PERSPECTIVE PRIMITIVES</p>
          <h2 className="font-display text-[44px] text-ink sm:text-[60px] lg:text-[76px]">
            The first <em className="text-accent">six</em> objects.
          </h2>
        </div>
        <p className="max-w-[26rem] text-[14px] leading-relaxed text-muted">
          Move your cursor across a card: ±10° perspective tilt, a travelling specular glare, and
          Z-elevated badges. Switch currency in the header — prices re-render live.
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={p.sku} p={p} index={i} />
        ))}
      </ul>
    </section>
  );
}
