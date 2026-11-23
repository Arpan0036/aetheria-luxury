"use client";

import type { PointerEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useFinePointer } from "@/lib/hooks/useFinePointer";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import type { Category, CategorySlug } from "@/types/database";

type BentoCategory = Category & { product_count: number };

const MAX_TILT = 6;
const SPRING = { stiffness: 160, damping: 20, mass: 0.5 };

/** Asymmetric 7/5 · 5/7 rhythm on desktop; 2-up on tablet; single column on mobile. */
const SPANS = [
  "lg:col-span-7 lg:h-[600px]",
  "lg:col-span-5 lg:h-[600px]",
  "lg:col-span-5 lg:h-[480px]",
  "lg:col-span-7 lg:h-[480px]",
];

const SHORT: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

function BentoCard({ category, index }: { category: BentoCategory; index: number }) {
  const router = useRouter();
  const fine = useFinePointer();
  const setCatalogCategory = useUIStore((s) => s.setCatalogCategory);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const spx = useSpring(px, SPRING);
  const spy = useSpring(py, SPRING);
  const glareOpacity = useSpring(hover, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(spy, [0, 1], [MAX_TILT, -MAX_TILT]);
  const rotateY = useTransform(spx, [0, 1], [-MAX_TILT, MAX_TILT]);
  const gx = useTransform(spx, (v) => `${v * 100}%`);
  const gy = useTransform(spy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(620px circle at ${gx} ${gy}, rgba(255,246,232,0.32), transparent 44%)`;

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!fine || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };
  const onSelect = () => {
    setCatalogCategory(category.slug);
    router.push(`/shop?category=${category.slug}`);
  };

  const img = category.image_url ?? `/images/categories/cat-${category.slug}.png`;
  const idx = String(index + 1).padStart(2, "0");
  const count = String(category.product_count).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay: (index % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn("h-[440px] [perspective:1200px] sm:h-[500px] md:h-[440px]", SPANS[index] ?? "lg:col-span-6")}
    >
      <motion.button
        type="button"
        onClick={onSelect}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        aria-label={`Explore ${category.name} — ${category.product_count} objects. Filters the archive below.`}
        style={fine ? { rotateX, rotateY, transformStyle: "preserve-3d" } : { transformStyle: "preserve-3d" }}
        className="group relative block h-full w-full rounded-[26px] text-left shadow-[0_40px_80px_-48px_rgb(var(--shadow-tint)/0.55)] will-change-transform"
      >
        {/* Base layer — translateZ(0): studio photograph + editorial scrim + specular sweep */}
        <div className="absolute inset-0 overflow-hidden rounded-[26px] border border-line bg-[#EFECE6] [transform:translateZ(0px)]">
          <Image
            src={img}
            alt={`${category.name} — ${category.subtitle}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 58vw"
            className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-105"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#141413]/85 via-[#141413]/25 to-[#141413]/5"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-[60%] w-[45%] -skew-x-12 bg-gradient-to-r from-transparent via-[#FFF8EC]/25 to-transparent opacity-0 transition-[left,opacity] duration-[1200ms] ease-[var(--ease-editorial)] group-hover:left-[120%] group-hover:opacity-100"
          />
        </div>

        {fine && (
          <motion.div
            aria-hidden
            style={{ background: glare, opacity: glareOpacity }}
            className="pointer-events-none absolute inset-0 rounded-[26px] mix-blend-soft-light [transform:translateZ(8px)]"
          />
        )}

        {/* Floating top badge — translateZ(25px) */}
        <div className="absolute inset-x-5 top-5 flex items-center justify-between [transform:translateZ(25px)] md:inset-x-6 md:top-6">
          <span className="glass rounded-full border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-ink">
            {`${idx} // ${count} OBJECTS`}
          </span>
          <span className="hidden rounded-full bg-[#141413]/55 px-3 py-1.5 font-mono text-[9.5px] tracking-[0.18em] text-[#F7F4EF]/85 backdrop-blur-md sm:inline">
            DEPT.{idx}
          </span>
        </div>

        {/* Floating bottom caption — translateZ(35px) */}
        <div className="absolute inset-x-5 bottom-5 flex flex-col gap-4 text-[#F7F4EF] [transform:translateZ(35px)] md:inset-x-7 md:bottom-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[30rem]">
            <h3 className="font-display text-[40px] leading-[0.98] sm:text-[48px] lg:text-[clamp(2.75rem,3.6vw,3.75rem)]">
              {SHORT[category.slug] ?? category.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[#F7F4EF]/80">{category.subtitle}</p>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center gap-2.5 self-start rounded-full border border-[#F7F4EF]/30 bg-[#F7F4EF]/10 pl-4 pr-1.5 text-[13px] font-medium backdrop-blur-md transition-[background-color,transform] duration-500 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5 group-hover:bg-[#F7F4EF] group-hover:text-[#141413] md:self-auto">
            Explore Archive
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#F7F4EF] text-[#141413] transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1 group-hover:bg-accent group-hover:text-accent-on">
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </span>
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}

export function BentoCategoryGrid({ categories }: { categories: BentoCategory[] }) {
  return (
    <section id="departments" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <header className="mb-10 grid gap-6 border-t border-line pt-6 md:mb-14 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
            § 01 — ARCHITECTURAL DEPARTMENTS // LIVE SUPABASE CATEGORIES
          </p>
          <h2 className="font-display text-[44px] text-ink sm:text-[60px] lg:text-[74px]">
            Four <em className="text-accent">departments</em>, one discipline.
          </h2>
        </div>
        <p className="max-w-[26rem] text-[14px] leading-relaxed text-muted">
          Each department is an archive of objects built to outlast their owners. Select one to open the filtered
          archive below.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {categories.map((c, i) => (
          <BentoCard key={c.id} category={c} index={i} />
        ))}
      </div>
    </section>
  );
}
