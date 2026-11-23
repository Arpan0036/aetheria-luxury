import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Lock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "GDPR, UK DPA & California CCPA Privacy Policy (/privacy)",
  description:
    "Official Privacy Policy and Data Protection Dossier for AETHERIA Archive Holdings (AETHERIA Objects Ltd.). Compliant with EU GDPR, UK Data Protection Act 2018, Swiss FADP, and California CCPA/CPRA.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "GDPR, UK DPA & California CCPA Privacy Policy | AETHERIA®",
    description:
      "Data governance, zero-brokerage privacy guarantee, PCI-DSS Level 1 payment encryption, and collector data rights.",
    url: "/privacy",
  },
};

const PRIVACY_SECTIONS = [
  {
    id: "data-collection",
    code: "01 // Data Collection",
    heading: "01 // Data Collection & Serialized Archive Registration",
    paragraphs: [
      "AETHERIA Archive Holdings and AETHERIA Objects Ltd. (collectively, 'AETHERIA', 'we', or 'our') operate under a strict data-minimization doctrine. We collect only the personal and technical data strictly necessary to fulfill serialized hardware commissions, process Delivered Duty Paid (DDP) customs clearance, and honor our 10-Year Serialized Chassis Archive Warranty.",
      "When you commission an object, create a Collector Sanctuary profile, or correspond with our Private Client Concierge, we process: (a) your full name and billing/shipping sanctuary coordinates; (b) your email address and telephone number required by DHL Express for international airwaybill notifications; (c) the laser-etched serial number(s) assigned to your hardware; and (d) your transaction ledger metadata.",
      "We do not harvest behavioral biometric profiles, microphone telemetry from our acoustic hardware, or third-party advertising broker graphs. All AETHERIA spatial audio and tactile computing objects function 100% offline without mandatory cloud tethering.",
    ],
  },
  {
    id: "gdpr-uk-dpa",
    code: "02 // GDPR & UK DPA Rights",
    heading: "02 // European Union GDPR, Swiss FADP & UK DPA Rights",
    paragraphs: [
      "For collectors residing in the European Economic Area (EEA), Switzerland, and the United Kingdom, AETHERIA Objects Ltd. (Talstrasse 82, 8001 Zürich, Switzerland; UK Representative Office: 24 Mount Street, Mayfair, London W1K 2TH) acts as the Data Controller under Regulation (EU) 2016/679 (General Data Protection Regulation), the Swiss Federal Act on Data Protection (FADP), and the UK Data Protection Act 2018.",
      "Our lawful bases for processing your personal data are: Art. 6(1)(b) GDPR (performance of a contract of sale, DDP shipping, and 10-year warranty ledger administration), Art. 6(1)(c) GDPR (statutory tax, customs, and accounting retention mandates), and Art. 6(1)(a) GDPR (explicit opt-in consent for Private Archive quarterly dispatches).",
      "You hold the absolute right to request: (i) a structured machine-readable export of your collector dossier (Right of Access & Portability); (ii) immediate rectification of shipping or warranty ownership records; (iii) erasure of non-statutory profile records ('Right to be Forgotten'); and (iv) restriction or withdrawal of marketing consent at any time by contacting dpo@aetheria.studio.",
    ],
  },
  {
    id: "california-ccpa",
    code: "03 // California CCPA Disclosure",
    heading: "03 // California CCPA / CPRA Notice at Collection",
    paragraphs: [
      "Pursuant to the California Consumer Privacy Act of 2018 (CCPA) as amended by the California Privacy Rights Act of 2020 (CPRA, Cal. Civ. Code § 1798.100 et seq.), California residents are entitled to specific disclosures regarding the categories of personal information collected over the preceding twelve (12) months.",
      "AETHERIA Does Not Sell or Share Personal Information: AETHERIA has never sold, rented, or shared collector personal information for cross-context behavioral advertising, and we do not offer financial incentives in exchange for personal data. Consequently, a 'Do Not Sell or Share My Personal Information' toggle is structurally enforced by default for every visitor.",
      "California collectors may exercise their Right to Know, Right to Delete, and Right to Correct by submitting a verifiable request via our Private Client Concierge (/contact) or emailing privacy@aetheria.studio. We verify requests by matching your email address and serialized order reference without requiring government identification.",
    ],
  },
  {
    id: "payment-encryption-cookies",
    code: "04 // Payment Encryption & Cookies",
    heading: "04 // PCI-DSS Level 1 Payment Encryption & Local Storage",
    paragraphs: [
      "Payment Card Tokenization: AETHERIA never transmits, processes, or stores raw Primary Account Numbers (PAN) or CVC security codes on our database servers. All payment authorizations are tokenized directly inside isolated PCI-DSS Level 1 hardware security modules (HSMs) over TLS 1.3 (256-bit AES-GCM encryption).",
      "First-Party Functional Storage Only: Our storefront utilizes strictly necessary first-party browser localStorage keys ('aetheria-cart-v1', 'aetheria-wishlist-v1', 'aetheria-auth-v1', and 'aetheria-theme') to preserve your collector bag, saved objects, currency preference (USD/GBP/EUR), and Warm Daylight / Velvet Espresso atmosphere across sessions.",
      "We deploy zero third-party retargeting pixels, zero cross-site tracking cookies, and zero session-replay scripts. Server logs are retained for 30 days strictly for DDoS mitigation and cryptographic audit integrity.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
          <span className="text-ink">PRIVACY POLICY (GDPR / UK DPA / CCPA)</span>
        </div>
        <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-ink">
          LAST UPDATED: NOVEMBER 2026
        </span>
      </nav>

      {/* Editorial Header */}
      <header className="mb-12 border-b border-line pb-10">
        <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
          LEGAL DOSSIER 01 {"//"} DATA PROTECTION & COLLECTOR PRIVACY
        </p>
        <h1 className="mt-2 font-display text-[42px] leading-[1.04] text-ink sm:text-[56px] lg:text-[68px]">
          GDPR / CCPA Privacy <em className="font-normal italic text-accent">Policy.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
          Privacy is an architectural requirement, not a compliance footnote. Our hardware operates
          without cloud surveillance, and our storefront records only what is required to deliver and
          warrant your serialized objects.
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
              <Lock className="size-3.5 text-accent" />
            </div>

            <nav aria-label="Privacy policy sections" className="mt-4">
              <ul className="space-y-1.5">
                {PRIVACY_SECTIONS.map((sec) => (
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
              <p className="font-semibold text-ink">DATA PROTECTION OFFICER</p>
              <p className="mt-1">AETHERIA Objects Ltd.</p>
              <p>Talstrasse 82, 8001 Zürich, CH</p>
              <a
                href="mailto:dpo@aetheria.studio"
                className="mt-1.5 inline-block text-accent underline-offset-4 hover:underline"
              >
                dpo@aetheria.studio
              </a>
            </div>
          </div>
        </aside>

        <div className="max-w-3xl space-y-12 lg:col-span-8">
          {PRIVACY_SECTIONS.map((section) => (
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

          {/* Cross-link to Terms and Concierge */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-line-strong bg-canvas p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-sage" />
              <span className="font-mono text-[11px] tracking-[0.15em] text-ink">
                ZERO THIRD-PARTY AD BROKERS · 100% GDPR / CCPA COMPLIANT
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/terms"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 font-mono text-[10.5px] tracking-[0.16em] text-ink transition-colors hover:border-ink"
              >
                COMMERCIAL TERMS OF SALE
                <ArrowUpRight className="size-3.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-mono text-[10.5px] tracking-[0.16em] text-canvas transition-colors hover:bg-accent"
              >
                SUBMIT DATA REQUEST
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
