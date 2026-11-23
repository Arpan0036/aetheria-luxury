"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { scrollToTarget } from "@/components/motion/SmoothScrollProvider";
import { CurrencySelector, ThemeSwitcher } from "@/components/storefront/Controls";
import { useUIStore } from "@/store/useUIStore";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function HeroSection() {
  const currency = useUIStore((s) => s.activeCurrency);

  return (
    <section className="relative mx-auto max-w-[1600px] px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20">
      {/* Meta row */}
      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0}
        className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 font-mono text-[10.5px] tracking-[0.18em] text-muted md:mb-16"
      >
        <span>VOL. 03 — WARM TRAVERTINE STUDIO PHOTOGRAPHY &amp; LIVE SUPABASE</span>
        <span className="hidden sm:inline">51.5072° N, 0.1276° W</span>
        <span>DAY 03 / 14</span>
      </motion.div>

      <div className="grid gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
        <div>
          <motion.p variants={rise} initial="hidden" animate="show" custom={1} className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage/35 px-3 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-sage">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden />
            NEW SEASON — EDITION Nº 01 NOW IN STOCK
          </motion.p>
          {/* LCP element: rendered visible from first paint (no opacity entrance). */}
          <h1 className="font-display text-[56px] text-ink sm:text-[84px] lg:text-[112px] xl:text-[132px]">
            Objects for
            <br />
            <em className="text-accent">considered</em> spaces.
          </h1>
          <motion.p variants={rise} initial="hidden" animate="show" custom={3} className="mt-8 max-w-[34rem] text-[16px] leading-[1.65] text-muted md:text-[17px]">
            Spatial audio and desk architecture, milled from warm stone, anodised alloy and
            vegetable-tanned leather. Each object is numbered, serviceable for life, and shipped
            in archival linen.
          </motion.p>
          <motion.div variants={rise} initial="hidden" animate="show" custom={4} className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton size="lg" onClick={() => scrollToTarget("#objects")}>
              Explore the Objects <ArrowRight className="size-4" strokeWidth={1.75} />
            </MagneticButton>
            <MagneticButton size="lg" variant="surface" onClick={() => scrollToTarget("#system")}>
              <BookOpen className="size-4" strokeWidth={1.5} /> Read the Editorial
            </MagneticButton>
          </motion.div>
        </div>

        {/* Type specimen + live controls */}
        <motion.aside
          variants={rise}
          initial="hidden"
          animate="show"
          custom={5}
          aria-label="Live typography and settings preview"
          className="flex flex-col justify-end gap-4"
        >
          <div className="rounded-[22px] border border-line bg-surface p-6 md:p-7">
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">TYPE HIERARCHY</span>
              <span className="font-mono text-[10px] text-muted">03 FAMILIES</span>
            </div>
            <dl className="divide-y divide-line">
              <div className="flex items-end justify-between gap-4 py-4">
                <dt className="font-display text-[44px] text-ink">Aa</dt>
                <dd className="text-right font-mono text-[10px] leading-relaxed tracking-wider text-muted">INSTRUMENT SERIF<br />DISPLAY · −0.03EM</dd>
              </div>
              <div className="flex items-end justify-between gap-4 py-4">
                <dt className="font-sans text-[30px] font-medium tracking-tight text-ink">Aa</dt>
                <dd className="text-right font-mono text-[10px] leading-relaxed tracking-wider text-muted">PLUS JAKARTA SANS<br />UI · BODY COPY</dd>
              </div>
              <div className="flex items-end justify-between gap-4 py-4">
                <dt className="tabular font-mono text-[26px] text-ink">{formatPrice(1240, currency)}</dt>
                <dd className="text-right font-mono text-[10px] leading-relaxed tracking-wider text-muted">JETBRAINS MONO<br />TABULAR-NUMS</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col gap-3 rounded-[22px] border border-line p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">CURRENCY</span>
              <CurrencySelector />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">ATMOSPHERE</span>
              <ThemeSwitcher />
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
