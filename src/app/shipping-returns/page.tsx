import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  PackageCheck,
  Plane,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";

export const metadata: Metadata = {
  title: "Global DDP Air Dispatch & 30-Day Sanctuary Trial (/shipping-returns)",
  description:
    "Complimentary DHL Express Delivered Duty Paid (DDP) air dispatch across the US, UK, EU, Canada, and Australia/NZ on orders over $150, backed by our 30-Day Sanctuary Trial and 48-hour refund guarantee.",
  alternates: {
    canonical: "/shipping-returns",
  },
  openGraph: {
    title: "Global DDP Air Dispatch & 30-Day Sanctuary Trial | AETHERIA®",
    description:
      "100% Prepaid DDP customs clearance via DHL Express and complimentary insured courier returns within 30 days.",
    url: "/shipping-returns",
  },
};

const LOGISTICS_MATRIX = [
  {
    code: "US",
    region: "United States (US)",
    hub: "JFK / LAX Priority Air Gateway",
    courierTier: "DHL Express DDP Air Priority",
    transitWindow: "2–4 Business Days",
    complimentaryThreshold: "Complimentary over $150 ($25 flat under $150)",
    customsDuties: "100% Prepaid DDP (Zero Section 301 / Import Tariffs at Door)",
  },
  {
    code: "UK",
    region: "United Kingdom (UK)",
    hub: "London Heathrow / East Midlands Hub",
    courierTier: "DHL Express DDP Time-Definite",
    transitWindow: "1–3 Business Days",
    complimentaryThreshold: "Complimentary over $150 / £120",
    customsDuties: "100% Prepaid DDP (20% UK Import VAT Settled by AETHERIA)",
  },
  {
    code: "EU",
    region: "European Union (EU-27 & Switzerland)",
    hub: "Zurich & Leipzig Intra-European Dispatch",
    courierTier: "DHL Express EuroPlus DDP",
    transitWindow: "1–3 Business Days",
    complimentaryThreshold: "Complimentary over $150 / €140",
    customsDuties: "100% Intra-EU & Swiss VAT Prepaid (Zero Customs Friction)",
  },
  {
    code: "CA",
    region: "Canada (CA)",
    hub: "Toronto YYZ / Vancouver YVR Gateway",
    courierTier: "DHL Express Worldwide DDP",
    transitWindow: "2–4 Business Days",
    complimentaryThreshold: "Complimentary over $150 USD",
    customsDuties: "100% Prepaid DDP (Federal GST/HST & Provincial Duties Covered)",
  },
  {
    code: "AU/NZ",
    region: "Australia & New Zealand (AU/NZ)",
    hub: "Sydney SYD / Melbourne MEL / Auckland AKL",
    courierTier: "DHL Express APAC Priority DDP",
    transitWindow: "3–5 Business Days",
    complimentaryThreshold: "Complimentary over $150 USD",
    customsDuties: "100% Prepaid DDP (Australian 10% GST & NZ Import Levies Covered)",
  },
];

const RETURN_PROTOCOL_STEPS = [
  {
    step: "STEP 01 // DAY 01–30",
    title: "Prepaid DHL Express Courier Pickup",
    summary:
      "Audition any AETHERIA object inside your own room acoustics for 30 calendar days. To initiate a return, enter your order number on our Concierge page. We issue a prepaid DHL Express waybill and schedule a complimentary courier collection directly from your residence or studio.",
    badge: "ZERO RETURN SHIPPING FEES",
    icon: Truck,
  },
  {
    step: "STEP 02 // +24 HOURS FROM RECEIPT",
    title: "Atelier Acoustic & Serial Verification",
    summary:
      "Upon arrival at our Zurich, New York, or London regional depot, our technicians inspect the serialized chassis and original mycelium/birch flight packaging within one business day — zero restocking fees, zero hidden deductions.",
    badge: "0% RESTOCKING FEE",
    icon: PackageCheck,
  },
  {
    step: "STEP 03 // WITHIN 48 HOURS",
    title: "48-Hour Original-Method Refund Guarantee",
    summary:
      "Within 48 hours of depot verification, 100% of your purchase price (including any initial priority shipping upgrade) is refunded directly to your original payment card or VIP settlement account, accompanied by an automated tax credit memo.",
    badge: "48-HR SETTLEMENT SLA",
    icon: RefreshCcw,
  },
];

export default function ShippingReturnsPage() {
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
          <span className="text-ink">SHIPPING, DDP & 30-DAY RETURNS</span>
        </div>
        <span className="text-sage">● DHL EXPRESS GOGREEN PLUS PARTNER</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-14 border-b border-line pb-12">
        <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
          TIER-1 GLOBAL LOGISTICS PROTOCOL {"//"} DELIVERED DUTY PAID (DDP)
        </p>
        <h1 className="mt-2 font-display text-[42px] leading-[1.03] text-ink sm:text-[58px] lg:text-[72px]">
          Global DDP Air Dispatch &{" "}
          <em className="font-normal italic text-accent">30-Day Sanctuary Trial.</em>
        </h1>
        <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
          Acquiring architectural audio and desk objects across borders should never involve customs
          brokerage delays or unexpected import bills. Every AETHERIA commission is dispatched via
          climate-neutral DHL Express Air Priority with 100% of duties, tariffs, and regional VAT
          prepaid at checkout.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line-strong bg-surface p-5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
              01 {"//"} COMPLIMENTARY THRESHOLD
            </p>
            <p className="mt-2 font-display text-[32px] text-ink">$150+ USD</p>
            <p className="mt-1 text-[13px] text-muted">
              Complimentary DHL Express DDP Air across US, UK, EU, CA & AU/NZ.
            </p>
          </div>
          <div className="rounded-2xl border border-line-strong bg-surface p-5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
              02 {"//"} SAME-DAY SERIAL DISPATCH
            </p>
            <p className="mt-2 font-display text-[32px] text-ink">&lt; 24 Hours</p>
            <p className="mt-1 text-[13px] text-muted">
              In-stock serialized objects leave our regional hub within 1 business day.
            </p>
          </div>
          <div className="rounded-2xl border border-line-strong bg-surface p-5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
              03 {"//"} SANCTUARY AUDITION WINDOW
            </p>
            <p className="mt-2 font-display text-[32px] text-accent">30 Days</p>
            <p className="mt-1 text-[13px] text-muted">
              Prepaid courier pickup & 48-hour full refund guarantee.
            </p>
          </div>
        </div>
      </header>

      {/* Section 1: Tier-1 Logistics Matrix Table (Desktop Table + Responsive Card Stack on Mobile) */}
      <section aria-labelledby="logistics-matrix-heading" className="mb-16 border-b border-line pb-16">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
              01 {"//"} REGIONAL TRANSIT & CUSTOMS LEDGER
            </p>
            <h2 id="logistics-matrix-heading" className="mt-1 font-display text-[34px] text-ink sm:text-[44px]">
              Tier-1 Global DDP Logistics Matrix.
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-sage">
            <Plane className="size-3.5" />
            100% INSURED LLOYD&apos;S OF LONDON TRANSIT POLICY
          </span>
        </div>

        {/* Desktop & Tablet Table (md and up) */}
        <div
          data-testid="logistics-matrix-table"
          className="hidden overflow-hidden rounded-[24px] border border-line-strong bg-surface md:block"
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-canvas/70 font-mono text-[10px] tracking-[0.18em] text-muted">
                <th className="px-6 py-4">DESTINATION REGION</th>
                <th className="px-6 py-4">COURIER TIER</th>
                <th className="px-6 py-4">TRANSIT WINDOW</th>
                <th className="px-6 py-4">COMPLIMENTARY THRESHOLD</th>
                <th className="px-6 py-4">CUSTOMS & DUTIES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[13.5px]">
              {LOGISTICS_MATRIX.map((row) => (
                <tr key={row.code} className="transition-colors hover:bg-canvas/45">
                  <td className="px-6 py-5">
                    <p className="font-medium text-ink">{row.region}</p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-muted">{row.hub}</p>
                  </td>
                  <td className="px-6 py-5 font-mono text-[12px] text-ink">{row.courierTier}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full border border-line-strong bg-canvas px-3 py-1 font-mono text-[11px] font-medium text-ink">
                      {row.transitWindow}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-ink">{row.complimentaryThreshold}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-sage">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      {row.customsDuties}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Card Stack (< md) */}
        <div data-testid="logistics-matrix-cards" className="grid gap-4 md:hidden">
          {LOGISTICS_MATRIX.map((row) => (
            <article
              key={row.code}
              className="rounded-[22px] border border-line-strong bg-surface p-5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                <span className="font-display text-[22px] text-ink">{row.region}</span>
                <span className="rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[10.5px] text-accent">
                  {row.transitWindow}
                </span>
              </div>
              <dl className="mt-3 space-y-2 text-[13px]">
                <div>
                  <dt className="font-mono text-[9.5px] tracking-[0.16em] text-muted">
                    COURIER TIER
                  </dt>
                  <dd className="font-mono text-[12px] text-ink">{row.courierTier}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[9.5px] tracking-[0.16em] text-muted">
                    COMPLIMENTARY THRESHOLD
                  </dt>
                  <dd className="text-ink">{row.complimentaryThreshold}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[9.5px] tracking-[0.16em] text-muted">
                    CUSTOMS & DUTIES
                  </dt>
                  <dd className="font-mono text-[11.5px] text-sage">{row.customsDuties}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: 30-Day Sanctuary Trial & 3-Step Insured Return Protocol */}
      <section aria-labelledby="return-protocol-heading" className="mb-16 border-b border-line pb-16">
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
            02 {"//"} 30-DAY SANCTUARY TRIAL & INSURED RETURN PROTOCOL
          </p>
          <h2 id="return-protocol-heading" className="mt-1 font-display text-[34px] text-ink sm:text-[44px]">
            Three Steps. Zero Friction. 48-Hour Settlement.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Every object arrives in a reusable custom crate with a pre-printed return dossier. If
            your commission does not integrate seamlessly with your space within 30 calendar days,
            our return protocol is completely complimentary.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {RETURN_PROTOCOL_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="flex flex-col justify-between rounded-[26px] border border-line-strong bg-surface p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] tracking-[0.18em] text-accent">
                      {item.step}
                    </span>
                    <span className="inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-canvas text-ink">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[28px] leading-snug text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{item.summary}</p>
                </div>

                <div className="mt-6 border-t border-line pt-4">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-[0.16em] text-sage">
                    <ShieldCheck className="size-4" />
                    {item.badge}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom Action Bar */}
      <section className="flex flex-col items-start justify-between gap-6 rounded-[28px] border border-line-strong bg-surface p-8 md:flex-row md:items-center md:p-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted">
            LIVE SHIPMENT TELEMETRY & CONCIERGE DESK
          </p>
          <h2 className="mt-1 font-display text-[28px] text-ink sm:text-[36px]">
            Need to Track an Active Dispatch or Schedule a Courier Pickup?
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/order/latest">
            <MagneticButton size="md">
              Track Serialized Order
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </MagneticButton>
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-canvas px-5 font-mono text-[11px] tracking-[0.16em] text-ink transition-colors hover:border-ink"
          >
            CONTACT CLIENT CONCIERGE →
          </Link>
        </div>
      </section>
    </div>
  );
}
