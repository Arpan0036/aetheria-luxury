import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Commercial Terms of Sale & 10-Year Archive Warranty (/terms)",
  description:
    "Commercial Terms of Sale, Delivered Duty Paid (DDP) title transfer, 30-Day Sanctuary Trial return terms, and 10-Year Serialized Chassis Warranty for AETHERIA Archive Holdings.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Commercial Terms of Sale & 10-Year Archive Warranty | AETHERIA®",
    description:
      "Governing commercial terms for US, UK, EU, Canadian, and Australian commissions from AETHERIA Objects Ltd.",
    url: "/terms",
  },
};

const TERMS_SECTIONS = [
  {
    id: "data-collection",
    code: "01 // Scope & Formation",
    heading: "01 // Commercial Scope, Contract Formation & Serialized Allocation",
    paragraphs: [
      "These Commercial Terms of Sale ('Terms') govern all retail and architectural trade commissions placed through aetheria.studio with AETHERIA Objects Ltd. (CHE-412.890.331, Talstrasse 82, 8001 Zürich, Switzerland) and its regional fulfillment subsidiaries in Delaware (USA) and London (United Kingdom).",
      "When you submit an order at /checkout, our system generates a serialized allocation number (format: AETH-2026-XXXX) and reserves physical stock from our archive ledger. A binding contract of sale is formed upon issuance of your serialized Order Confirmation and downloadable tax invoice.",
      "All objects are offered in strictly numbered production batches. Because natural Tivoli Roman travertine and walnut timber exhibit organic mineral veining and grain variation, minor lithographic differences between studio photographs and your delivered plinth are hallmarks of natural authenticity rather than manufacturing defects.",
    ],
  },
  {
    id: "gdpr-uk-dpa",
    code: "02 // Pricing, DDP & Taxes",
    heading: "02 // Multi-Currency Pricing, Delivered Duty Paid (DDP) & Title Transfer",
    paragraphs: [
      "All prices displayed in USD ($), GBP (£), or EUR (€) on the AETHERIA storefront are inclusive of Delivered Duty Paid (Incoterms® 2020 DDP) customs clearance for deliveries to the United States, United Kingdom, European Union, Switzerland, Canada, Australia, and New Zealand.",
      "Orders exceeding $150 USD (or currency equivalent) qualify automatically for complimentary DHL Express DDP Air Dispatch. For commissions below $150 USD, a flat $25 USD insured air courier fee applies. Optional White-Glove Architectural Crating ($45 USD) is available at checkout.",
      "Risk of loss and legal title to each serialized object remain with AETHERIA Objects Ltd. until the parcel is physically signed for at your designated delivery sanctuary. Every shipment is insured for 100% of its replacement value through our master transit policy.",
    ],
  },
  {
    id: "california-ccpa",
    code: "03 // 30-Day Trial &Statutory Rights",
    heading: "03 // 30-Day Sanctuary Trial, EU/UK Right of Withdrawal & Refunds",
    paragraphs: [
      "In addition to your statutory 14-day cooling-off right under the UK Consumer Contracts Regulations 2013 and EU Directive 2011/83/EU, AETHERIA grants every collector globally a 30-Day Sanctuary Trial commencing on the date of recorded delivery.",
      "To exercise a return within 30 calendar days, notify our Private Client Concierge (/contact) with your order reference. We provide a prepaid DHL Express return waybill and complimentary courier pickup. Returned objects must include their serialized chassis, accessories, and original protective flight packaging without structural abuse.",
      "Upon verification at our regional depot, AETHERIA executes a 100% refund to your original payment method within 48 hours, with zero restocking fees.",
    ],
  },
  {
    id: "payment-encryption-cookies",
    code: "04 // 10-Year Archive Warranty",
    heading: "04 // 10-Year Serialized Chassis Warranty & Right-to-Repair Commitment",
    paragraphs: [
      "Every AETHERIA object is backed by a transferable 10-Year Serialized Chassis Archive Warranty from the date of initial dispatch. This warranty guarantees that the CNC-milled metal structure, mineral travertine base, planar-magnetic or coaxial drivers, DAC circuitry, and mechanical switch assemblies remain free from material and workmanship defects.",
      "In accordance with our Right-to-Repair doctrine, collectors are expressly permitted to open their hardware using standard Torx T6 drivers to replace ear cushions, batteries, or modular sub-assemblies using official AETHERIA service parts without voiding their 10-year warranty.",
      "These Terms are governed by the substantive laws of Switzerland and the mandatory consumer protection statutes of your country of habitual residence (including US federal and state consumer warranties, the UK Consumer Rights Act 2015, and EU Consumer Sales Directives).",
    ],
  },
];

export default function TermsOfSalePage() {
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
          <span className="text-ink">COMMERCIAL TERMS OF SALE</span>
        </div>
        <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-ink">
          LAST UPDATED: NOVEMBER 2026
        </span>
      </nav>

      {/* Editorial Header */}
      <header className="mb-12 border-b border-line pb-10">
        <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
          LEGAL DOSSIER 02 {"//"} INCOTERMS® 2020 DDP & 10-YEAR WARRANTY CONTRACT
        </p>
        <h1 className="mt-2 font-display text-[42px] leading-[1.04] text-ink sm:text-[56px] lg:text-[68px]">
          Commercial Terms of <em className="font-normal italic text-accent">Sale.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
          Transparent commercial terms engineered for international collectors across the United
          States, United Kingdom, European Union, Canada, and APAC.
        </p>
      </header>

      {/* Split Layout: Sticky Left Section Navigator + Comfortable max-w-3xl Reading Column */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
        <aside className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="rounded-[24px] border border-line-strong bg-surface p-6">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.18em] text-ink">
                SECTION NAVIGATOR
              </span>
              <Scale className="size-3.5 text-accent" />
            </div>

            <nav aria-label="Commercial terms sections" className="mt-4">
              <ul className="space-y-1.5">
                {TERMS_SECTIONS.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 font-mono text-[11px] tracking-[0.13em] text-ink transition-colors hover:bg-canvas hover:text-accent"
                    >
                      <span>{sec.code}</span>
                      <span aria-hidden>→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 border-t border-line pt-4 font-mono text-[10.5px] leading-relaxed text-muted">
              <p className="font-semibold text-ink">CORPORATE REGISTRY</p>
              <p className="mt-1">AETHERIA Objects Ltd.</p>
              <p>UID: CHE-412.890.331</p>
              <p>Talstrasse 82, 8001 Zürich, CH</p>
            </div>
          </div>
        </aside>

        <div className="max-w-3xl space-y-12 lg:col-span-8">
          {TERMS_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-[26px] border border-line-strong bg-surface p-6 sm:p-9"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                <span className="font-mono text-[10.5px] font-semibold tracking-[0.18em] text-accent">
                  {section.code.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
                  LAST UPDATED: NOVEMBER 2026
                </span>
              </div>
              <h2 className="mt-4 font-display text-[28px] leading-snug text-ink sm:text-[34px]">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted sm:text-[15.5px]">
                {section.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          {/* Cross-link to Privacy and Shipping */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-line-strong bg-canvas p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-sage" />
              <span className="font-mono text-[11px] tracking-[0.15em] text-ink">
                INCOTERMS® 2020 DDP · 30-DAY TRIAL · 10-YEAR CHASSIS WARRANTY
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/privacy"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 font-mono text-[10.5px] tracking-[0.16em] text-ink transition-colors hover:border-ink"
              >
                PRIVACY POLICY
                <ArrowUpRight className="size-3.5" />
              </Link>
              <Link
                href="/shipping-returns"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-mono text-[10.5px] tracking-[0.16em] text-canvas transition-colors hover:bg-accent"
              >
                DDP LOGISTICS MATRIX
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
