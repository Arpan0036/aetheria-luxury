"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useFinePointer } from "@/lib/hooks/useFinePointer";
import { cn } from "@/lib/utils";

const CHAPTERS = [
  {
    index: "01",
    kicker: "CNC AEROSPACE AL-6061 & TITANIUM",
    title: "Milled, never moulded.",
    body: "Milled from a solid 4.2kg billet of raw aluminum over 14 hours. Bead-blasted with glass media and anodized to a 25-micron architectural finish.",
    specs: ["TOLERANCE: ±0.01MM", "FINISH: 25μm ANODIZED", "ZERO PLASTIC CHASSIS"],
    image: "/images/products/aether-01-headphones.png",
    plate: "AETHER-01 // YOKE + CHASSIS",
    coords: ["X +12.40", "Y −03.18", "Z +140.00"],
  },
  {
    index: "02",
    kicker: "HAND-HONED ROMAN TRAVERTINE",
    title: "Stone that listens.",
    body: "Quarried in Tivoli, Italy. Each unsealed stone plinth retains its natural porous cavities, providing high-mass acoustic damping that eliminates micro-vibrations.",
    specs: ["DENSITY: 2.41 G/CM³", "ORIGIN: TIVOLI, ITALY", "ACOUSTIC ISOLATION: -38dB"],
    image: "/images/products/monolith-desk-lamp.png",
    plate: "MONOLITH 02 // TRAVERTINE PLINTH",
    coords: ["X −08.72", "Y +11.05", "Z +140.00"],
  },
  {
    index: "03",
    kicker: "BESPOKE BERYLLIUM & CIRCADIAN OPTICS",
    title: "Engineered for decades.",
    body: "Custom 50mm pure beryllium acoustic transducers and CRI 98+ borosilicate optical diffusers engineered for a 25-year operational lifespan.",
    specs: ["THD: <0.04% @ 1KHZ", "OPTICS: CRI 98+ BOROSILICATE", "WARRANTY: 10-YEAR ARCHIVE"],
    image: "/images/products/kinetic-65-keyboard.png",
    plate: "KINETIC-65 // FIELD ASSEMBLY",
    coords: ["X +04.16", "Y +22.90", "Z +140.00"],
  },
] as const;

/** Staggered isometric offsets inside the stage (percent of stack box). */
const PLATE_POS = [
  { top: "0%", left: "0%" },
  { top: "11%", left: "23%" },
  { top: "22%", left: "46%" },
];

function Crosshair() {
  return (
    <svg aria-hidden viewBox="0 0 100 125" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full">
      <g stroke="#F7F4EF" strokeOpacity="0.55" strokeWidth="0.25" fill="none" vectorEffect="non-scaling-stroke">
        <line x1="50" y1="0" x2="50" y2="125" strokeDasharray="1.5 1.5" />
        <line x1="0" y1="62.5" x2="100" y2="62.5" strokeDasharray="1.5 1.5" />
        <circle cx="50" cy="62.5" r="9" />
        <circle cx="50" cy="62.5" r="1" fill="#F7F4EF" />
        <path d="M4 10 V4 H10 M90 4 H96 V10 M96 115 V121 H90 M10 121 H4 V115" strokeOpacity="0.9" />
      </g>
    </svg>
  );
}

function LayerStage({ active }: { active: number }) {
  const fine = useFinePointer();
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 90, damping: 18 });
  const smy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotateX = useTransform(smy, [-0.5, 0.5], [18, 10]);
  const rotateY = useTransform(smx, [-0.5, 0.5], [-23, -13]);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const gridY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const stackY = useTransform(scrollYProgress, [0, 1], [36, -36]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const ch = CHAPTERS[active];

  return (
    <div
      ref={stageRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-line bg-surface [perspective:1200px] sm:aspect-[7/6]"
    >
      {/* Blueprint grid — scroll-linked parallax */}
      <motion.div
        aria-hidden
        style={{ y: gridY }}
        className="absolute -inset-y-[10%] inset-x-0 opacity-70 [background-image:linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] [background-size:40px_40px]"
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between font-mono text-[9.5px] tracking-[0.18em] text-muted md:inset-x-6 md:top-5">
        <span>STAGE // ISO 14° · −18° · 4°</span>
        <span className="text-ink">CH {ch.index} / 03</span>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-end justify-between font-mono text-[9.5px] tracking-[0.18em] text-muted md:inset-x-6 md:bottom-5">
        <span className="hidden sm:inline">LAYER INSPECTOR — 3 PLATES</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ch.index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="tabular text-ink"
          >
            {ch.coords.join(" · ")}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Isometric plate stack */}
      <motion.div
        style={{ rotateX, rotateY, rotateZ: 4, y: stackY, transformStyle: "preserve-3d" }}
        className="absolute inset-x-[12%] bottom-[12%] top-[14%]"
      >
        {CHAPTERS.map((c, i) => {
          const isActive = i === active;
          const depth = isActive ? 130 : -36 * Math.abs(i - active);
          return (
            <motion.figure
              key={c.index}
              animate={{ z: depth, opacity: isActive ? 1 : 0.62, scale: isActive ? 1 : 0.95 }}
              transition={{ type: "spring", stiffness: 110, damping: 18, mass: 0.9 }}
              style={{ ...PLATE_POS[i], transformStyle: "preserve-3d" }}
              className="absolute m-0 aspect-[4/5] w-[54%]"
            >
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden rounded-[16px] border bg-[#EFECE6] transition-shadow duration-700",
                  isActive
                    ? "border-[#F7F4EF]/60 shadow-[0_50px_80px_-30px_rgb(var(--shadow-tint)/0.6)]"
                    : "border-line shadow-[0_20px_40px_-30px_rgb(var(--shadow-tint)/0.5)]",
                )}
              >
                <Image
                  src={c.image}
                  alt={c.plate}
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="object-cover"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#141413]/55 via-transparent to-[#141413]/10" />
                <Crosshair />
                <figcaption className="absolute inset-x-2.5 bottom-2.5 font-mono text-[8.5px] tracking-[0.14em] text-[#F7F4EF] sm:text-[9.5px]">
                  {`${c.index} // ${c.plate}`}
                </figcaption>
              </div>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="glass absolute -right-3 -top-3 rounded-full border border-line px-2.5 py-1 font-mono text-[8.5px] tracking-[0.14em] text-ink [transform:translateZ(30px)] sm:text-[9.5px]"
                >
                  Z-ELEV +{depth.toFixed(0)}MM
                </motion.span>
              )}
            </motion.figure>
          );
        })}
      </motion.div>
    </div>
  );
}

export function MaterialStorySection() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  // Scroll-activated chapters on desktop (sticky stage); click-activated everywhere.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !window.matchMedia("(min-width: 1024px)").matches) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-chapter]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.getAttribute("data-chapter")));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const ch = CHAPTERS[active];

  return (
    <section id="anatomy" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <header className="mb-10 grid gap-6 border-t border-line pt-6 md:mb-14 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
            § 03 — THE ANATOMY OF PERMANENCE // MATERIAL DOSSIER
          </p>
          <h2 className="font-display text-[44px] text-ink sm:text-[60px] lg:text-[74px]">
            The anatomy of <em className="text-accent">permanence.</em>
          </h2>
        </div>
        <p className="max-w-[26rem] text-[14px] leading-relaxed text-muted">
          Three materials, chosen for mass, tolerance and time. This is where the price of an AETHERIA object goes.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Right — sticky 3D layered inspector */}
        <div className="lg:order-2 lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <LayerStage active={active} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={ch.index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 flex flex-wrap gap-2"
                aria-label={`Chapter ${ch.index} specifications`}
              >
                {ch.specs.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-ink"
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>

        {/* Left — narrative chapters */}
        <ol ref={listRef} className="flex flex-col gap-3 lg:order-1 lg:col-span-5 lg:gap-0">
          {CHAPTERS.map((c, i) => {
            const isActive = i === active;
            return (
              <li key={c.index} data-chapter={i} className="lg:flex lg:min-h-[62vh] lg:items-center">
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-full rounded-[22px] border p-5 text-left transition-all duration-500 ease-[var(--ease-editorial)] md:p-7",
                    isActive
                      ? "border-line-strong bg-surface shadow-[0_30px_60px_-44px_rgb(var(--shadow-tint)/0.55)]"
                      : "border-transparent opacity-55 hover:opacity-85",
                  )}
                >
                  <p className="font-mono text-[10.5px] tracking-[0.18em] text-accent">{`${c.index} // ${c.kicker}`}</p>
                  <h3 className="mt-3 font-display text-[34px] leading-[1.02] text-ink md:text-[44px]">{c.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{c.body}</p>
                  <p className="mt-5 border-t border-line pt-4 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-ink">
                    {c.specs.join("  •  ")}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
