import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, Cpu, Globe, Layers, ShieldCheck, Wrench } from "lucide-react";
import { Tilt3DCard } from "@/components/motion/Tilt3DCard";
import { MagneticButton } from "@/components/motion/MagneticButton";

export const metadata: Metadata = {
  title: "The AETHERIA Manifesto & Atelier",
  description:
    "Discover the Zurich and Copenhagen design archive behind AETHERIA®. 14-hour 5-axis CNC aluminum milling, single-quarry Tivoli Roman travertine, right-to-repair modularity, and a 10-year serialized chassis warranty.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "The AETHERIA Manifesto & Atelier | AETHERIA®",
    description:
      "Objects engineered to outlast obsolescence. Explore our Zurich acoustic laboratory and Copenhagen industrial atelier.",
    url: "/about",
  },
};

const SPEC_METRICS = [
  {
    code: "METRIC 01 // MACHINING CADENCE",
    metric: "14 HRS",
    title: "Average 5-Axis CNC Milling Time",
    detail:
      "Every acoustic chamber and desk monolith is hogged from a single solid billet of 6061-T6 aerospace aluminum or Grade-5 titanium — zero stamped sheet metal, zero structural adhesives.",
  },
  {
    code: "METRIC 02 // LITHOGRAPHIC ORIGIN",
    metric: "TIVOLI, IT",
    title: "Single-Quarry Roman Travertine",
    detail:
      "Our mineral acoustic plinths and weighted bases are hand-selected from a family-operated quarry in Tivoli, Italy, open-pore honed to preserve natural acoustic damping and thermal mass.",
  },
  {
    code: "METRIC 03 // PERMANENCE GUARANTEE",
    metric: "10 YEARS",
    title: "Serialized Chassis Archive Warranty",
    detail:
      "Each object carries a laser-etched serial number registered in our Zurich archive ledger, backed by a 10-year structural guarantee and modular driver/battery serviceability.",
  },
];

const ATELIER_PILLARS = [
  {
    index: "01",
    tag: "PROVENANCE // RAW MATTER",
    title: "Material Provenance Over Synthetic Veneers",
    copy: "Modern consumer electronics rely on painted polycarbonate designed to look pristine for twelve months and degrade within thirty-six. AETHERIA rejects surface coatings that peel. We work exclusively in materials that develop an honest patina: bead-blasted 6061-T6 aluminum, raw Tivoli travertine, PVD-brushed titanium, and vegetable-tanned full-grain saddle leather from Tuscany.",
    bullets: [
      "Zero spray-painted plastics or faux-metallic PVD films",
      "Individually ultrasonic-bathed and glass-bead anodized in 45-micron coats",
      "Acoustic stone bases density-tested by ultrasonic pulse velocity",
    ],
    icon: Layers,
    image: "/images/products/archive-04-monitor-riser.png",
    imageAlt: "AETHERIA ARCHIVE-04 Modular Monitor Riser crafted from solid walnut and bead-blasted aluminum",
  },
  {
    index: "02",
    tag: "MODULARITY // RIGHT TO REPAIR",
    title: "Right-to-Repair Architecture with Torx T6 Fasteners",
    copy: "An object cannot claim permanence if a depleted battery or worn ear cushion turns it into landfill. Every AETHERIA chassis is assembled strictly with exposed stainless-steel Torx T6 fasteners and gold-plated spring-pin interconnects. Collectors receive a complete exploded service schematic and can replace transducers, DAC boards, or lithium cells in under ten minutes.",
    bullets: [
      "100% glue-free internal assembly across all 12 archive objects",
      "Guaranteed spare part and transducer availability for 10+ years",
      "Open step-by-step service blueprints included with every serialized unit",
    ],
    icon: Wrench,
    image: "/images/products/aether-01-headphones.png",
    imageAlt: "AETHER-01 Spatial Reference Headphones showing CNC aluminum earcups and modular headband",
  },
  {
    index: "03",
    tag: "LOGISTICS // CARBON-NEUTRAL DDP",
    title: "Carbon-Neutral Air Dispatch & Plastic-Free Crating",
    copy: "From our European assembly benches to sanctuaries in New York, London, Zurich, Tokyo, and Sydney, every commission travels via DHL Express GoGreen Plus with Sustainable Aviation Fuel (SAF) offsets. Packaging is molded from unbleached mycelium pulp and Reusable FSC birch flight cases — zero expanded polystyrene.",
    bullets: [
      "100% Prepaid Delivered Duty Paid (DDP) clearance across US, UK, EU, CA & AU",
      "Biodegradable mycelium acoustic inserts + cotton archive dust bags",
      "Full lifecycle carbon accounting audited annually in Zurich",
    ],
    icon: Globe,
    image: "/images/products/solaris-halo-lamp.png",
    imageAlt: "SOLARIS Halo Atmospheric Lamp illuminating warm travertine stone surface",
  },
];

const STUDIOS = [
  {
    city: "ZURICH // ACOUSTIC & DSP LAB",
    address: "Talstrasse 82, 8001 Zürich, Switzerland",
    focus: "Anechoic planar-magnetic driver calibration, FPGA DAC architecture, and final serial laser-etching.",
    coordinates: "47.3717° N, 8.5364° E",
  },
  {
    city: "COPENHAGEN // INDUSTRIAL ATELIER",
    address: "Bredgade 45, 1260 København K, Denmark",
    focus: "Architectural form study, mineral & timber prototyping, and human-factor tactile switch engineering.",
    coordinates: "55.6838° N, 12.5902° E",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-8 md:py-20">
      {/* Breadcrumb bar */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 font-mono text-[10.5px] tracking-[0.18em] text-muted"
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="transition-colors hover:text-ink">
            HOME
          </Link>
          <span>/</span>
          <span className="text-ink">MANIFESTO & ATELIER</span>
        </div>
        <span className="text-sage">● ARCHIVE DOSSIER // REV 2026.11</span>
      </nav>

      {/* 1. Editorial Hero */}
      <section className="grid gap-10 border-b border-line pb-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-20">
        <div>
          <p
            data-testid="about-hero-tag"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.2em] text-ink"
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            EST. 2026 {"//"} ZURICH & COPENHAGEN DESIGN ARCHIVE
          </p>
          <h1 className="font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-ink sm:text-[60px] lg:text-[76px]">
            Objects Engineered to Outlast{" "}
            <em className="font-normal italic text-accent">Obsolescence.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-muted sm:text-[17.5px]">
            AETHERIA was founded by acoustic physicists in Zurich and industrial architects in
            Copenhagen around a single conviction: the tools that anchor our daily thinking spaces
            should age like brutalist architecture and mechanical horology — not disposable
            seasonal gadgets.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/shop">
              <MagneticButton size="lg">
                Explore the 12-Object Archive
                <ArrowUpRight className="size-4" strokeWidth={1.75} />
              </MagneticButton>
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-13 items-center gap-2 rounded-full border border-line-strong bg-surface px-6 font-mono text-[11px] font-medium tracking-[0.16em] text-ink transition-colors hover:border-ink"
            >
              BOOK AN ATELIER LISTENING SESSION →
            </Link>
          </div>
        </div>

        {/* Hero visual plate */}
        <div className="relative overflow-hidden rounded-[28px] border border-line-strong bg-surface p-4 shadow-[0_24px_60px_-28px_rgb(var(--shadow-tint)/0.25)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-canvas">
            <Image
              src="/images/products/sonoscape-obelisk-speaker.png"
              alt="SONOSCAPE Obelisk Spatial Monolith Speaker on Roman travertine plinth"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-line/60 bg-canvas/85 px-3.5 py-2 backdrop-blur-md">
              <span className="font-mono text-[10px] tracking-[0.16em] text-ink">
                FIG 01 {"//"} SONOSCAPE OBELISK ACOUSTIC CHAMBER
              </span>
              <span className="font-mono text-[10px] tracking-[0.16em] text-accent">
                CNC 6061-T6 + TRAVERTINE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 3D Architectural Spec Strip (Tilt3DCard) */}
      <section aria-labelledby="spec-strip-heading" className=" border-b border-line py-14 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
              01 {"//"} ARCHITECTURAL TOLERANCES
            </p>
            <h2 id="spec-strip-heading" className="mt-1 font-display text-[32px] text-ink sm:text-[42px]">
              Measured in Hours, Quarries, and Decades.
            </h2>
          </div>
          <p className="font-mono text-[10.5px] tracking-[0.16em] text-muted">
            ISO-2768-M PRECISION STANDARD
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SPEC_METRICS.map((item) => (
            <Tilt3DCard
              key={item.metric}
              maxTilt={6}
              className="flex h-full flex-col justify-between rounded-[26px] border border-line-strong bg-surface p-7 shadow-[0_20px_50px_-30px_rgb(var(--shadow-tint)/0.25)]"
            >
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted">{item.code}</p>
                <p
                  data-testid={`about-metric-${item.metric.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`}
                  className="mt-4 font-display text-[52px] leading-none text-accent sm:text-[64px]"
                >
                  {item.metric}
                </p>
                <h3 className="mt-3 font-display text-[24px] leading-snug text-ink">
                  {item.title}
                </h3>
              </div>
              <p className="mt-5 border-t border-line pt-4 text-[14px] leading-relaxed text-muted">
                {item.detail}
              </p>
            </Tilt3DCard>
          ))}
        </div>
      </section>

      {/* 3. Atelier Storytelling Grid */}
      <section aria-labelledby="storytelling-heading" className="border-b border-line py-14 md:py-20">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
            02 {"//"} THE ATELIER DOCTRINE
          </p>
          <h2 id="storytelling-heading" className="mt-2 font-display text-[36px] text-ink sm:text-[48px]">
            Three Principles of Permanent Industrial Design.
          </h2>
        </div>

        <div className="space-y-12">
          {ATELIER_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            const reversed = idx % 2 === 1;
            return (
              <article
                key={pillar.index}
                className="grid gap-8 rounded-[28px] border border-line bg-surface/75 p-6 md:p-10 lg:grid-cols-12 lg:items-center"
              >
                <div className={reversed ? "lg:col-span-7 lg:order-2" : "lg:col-span-7"}>
                  <div className="flex items-center gap-3 font-mono text-[10.5px] tracking-[0.18em] text-accent">
                    <span className="inline-flex size-8 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <span>
                      CHAPTER {pillar.index} {"//"} {pillar.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[30px] leading-tight text-ink sm:text-[38px]">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-[16px]">
                    {pillar.copy}
                  </p>
                  <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
                    {pillar.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 font-mono text-[11.5px] tracking-wide text-ink"
                      >
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage" strokeWidth={1.8} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={reversed ? "lg:col-span-5 lg:order-1" : "lg:col-span-5"}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-strong bg-canvas">
                    <Image
                      src={pillar.image}
                      alt={pillar.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 38vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. Dual European Laboratories & Final CTA */}
      <section className="pt-14 md:pt-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {STUDIOS.map((studio) => (
            <div
              key={studio.city}
              className="rounded-[24px] border border-line-strong bg-surface p-7"
            >
              <div className="flex items-center justify-between gap-3 font-mono text-[10.5px] tracking-[0.18em] text-muted">
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <Compass className="size-3.5 text-accent" />
                  {studio.city}
                </span>
                <span>{studio.coordinates}</span>
              </div>
              <p className="mt-3 font-display text-[24px] text-ink">{studio.address}</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{studio.focus}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-[28px] border border-line-strong bg-ink p-8 text-canvas md:flex-row md:items-center md:p-12">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.2em] text-canvas/70">
              READY FOR COMMISSION {"//"} SERIALIZED BATCH 2026
            </p>
            <h2 className="mt-2 font-display text-[32px] leading-tight sm:text-[44px]">
              Inspect Every Object in 3D Spatial Detail.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-13 items-center gap-2 rounded-full bg-accent px-7 font-mono text-[11.5px] font-semibold tracking-[0.16em] text-accent-on transition-colors hover:bg-accent-hover"
            >
              ENTER THE ARCHIVE (/SHOP)
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </Link>
            <Link
              href="/shipping-returns"
              className="inline-flex h-13 items-center gap-2 rounded-full border border-canvas/25 px-6 font-mono text-[11px] tracking-[0.16em] text-canvas transition-colors hover:border-canvas"
            >
              <Cpu className="size-3.5" />
              DDP LOGISTICS & 30-DAY TRIAL
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
