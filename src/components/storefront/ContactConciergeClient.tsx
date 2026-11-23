"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { submitConciergeInquiryAction } from "@/app/actions/engagement";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { cn } from "@/lib/utils";
import type { ConciergeInquiryTopic } from "@/types/database";

const TOPICS: ConciergeInquiryTopic[] = [
  "Product Specification",
  "Order Dispatch",
  "Trade & Architectural Inquiry",
  "Warranty Claim",
];

const LISTENING_STUDIOS = [
  {
    code: "01 // ZURICH ATELIER (HQ)",
    name: "Zurich Atelier & Anechoic Chamber",
    address: "Talstrasse 82, 8001 Zürich, Switzerland",
    hours: "Mon–Sat · 10:00–19:00 CET (Private Appointment)",
    phone: "+41 44 580 26 01",
    featured: "Full 12-Object Archive + Custom Stone Calibration",
  },
  {
    code: "02 // NEW YORK SOHO LOFT",
    name: "New York SoHo Listening Sanctuary",
    address: "118 Mercer Street, Suite 4B, New York, NY 10012",
    hours: "Tue–Sun · 11:00–20:00 EST (Walk-In & Private Booking)",
    phone: "+1 (212) 555-0194",
    featured: "AETHER-01 Reference Rig, SONOSCAPE Obelisk & MONOLITH Desk System",
  },
  {
    code: "03 // LONDON MAYFAIR SANCTUARY",
    name: "London Mayfair Architectural Gallery",
    address: "24 Mount Street, Mayfair, London W1K 2TH, United Kingdom",
    hours: "Mon–Sat · 10:00–18:30 GMT (Walk-In & Trade Consultations)",
    phone: "+44 20 7946 0821",
    featured: "Acoustic Listening Room + Interior Architect Material Library",
  },
];

const TIER1_FAQS = [
  {
    id: "faq-ddp",
    question: "Are import customs, VAT, and duties prepaid for US, UK, and EU deliveries?",
    answer:
      "Yes. Every AETHERIA commission ships via DHL Express Delivered Duty Paid (DDP). All US Section 301 tariffs, UK import VAT (20%), EU customs duties, Canadian GST/HST, and Australian GST are 100% settled by AETHERIA prior to dispatch. You will never receive a surprise courier customs invoice upon delivery.",
  },
  {
    id: "faq-power",
    question: "Are AETHERIA powered objects compatible with 110V US and 230V UK/EU mains power?",
    answer:
      "Every mains-powered AETHERIA object — including the SONOSCAPE Obelisk, VALKYRIE Reference DAC/Amp, SOLARIS Halo Lamp, and LUMEN Travertine Lantern — incorporates a universal medical-grade auto-switching toroidal power stage rated for 100V–240V AC (50/60 Hz). Region-specific braided power leads (NEMA 5-15 US, BS 1363 UK, CEE 7/7 EU Schuko, and AS/NZS 3112) are included based on your destination country.",
  },
  {
    id: "faq-warranty",
    question: "What does the 10-Year Serialized Chassis Archive Warranty cover?",
    answer:
      "Your laser-etched serial number entitles you to 10 years of comprehensive structural and electronic protection covering CNC aluminum/titanium chassis integrity, planar-magnetic and coaxial transducers, FPGA DAC boards, and rotary encoders. If a component requires service, we dispatch a prepaid DHL Express flight case to your door or ship a modular replacement assembly with Torx T6 tools.",
  },
  {
    id: "faq-trade",
    question: "Do you offer B2B architectural trade pricing and custom stone or anodizing finishes?",
    answer:
      "Yes. Our Architectural & Interior Trade Desk supports residential studios, executive sanctuaries, and boutique hospitality commissions across North America, Europe, and APAC. Approved trade partners receive tiered volume allocation (minimum 5 units), bespoke stone honing, and dedicated net-30 invoicing. Select 'Trade & Architectural Inquiry' in the form to request our CAD/BIM library.",
  },
  {
    id: "faq-trial",
    question: "How does the 30-Day Sanctuary Trial and prepaid DHL courier return work?",
    answer:
      "We believe acoustic and tactile objects must be evaluated inside your own architecture. You have 30 calendar days from delivery to audition any object. If it does not elevate your space, submit a return request via our Private Concierge; we schedule a complimentary insured DHL Express pickup from your residence and issue a 100% refund to your original payment method within 48 hours of atelier inspection.",
  },
];

export function ContactConciergeClient() {
  const [openFaqId, setOpenFaqId] = useState<string>(TIER1_FAQS[0].id);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<ConciergeInquiryTopic>("Product Specification");
  const [orderReference, setOrderReference] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketConfirmation, setTicketConfirmation] = useState<{
    ticketNumber: string;
    fullName: string;
    email: string;
    subject: string;
    orderReference: string | null;
    mode: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitConciergeInquiryAction({
        full_name: fullName,
        email,
        subject,
        order_reference: orderReference || null,
        message,
      });

      if (!res.ok) {
        setErrorMessage(res.error ?? "Unable to log inquiry. Please check your details.");
        return;
      }

      setTicketConfirmation({
        ticketNumber: res.ticketNumber ?? "CONC-8841",
        fullName: fullName.trim(),
        email: email.trim(),
        subject,
        orderReference: orderReference.trim() ? orderReference.trim().toUpperCase() : null,
        mode: res.mode,
      });
    });
  };

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
          <span className="text-ink">PRIVATE CLIENT CONCIERGE</span>
        </div>
        <span className="inline-flex items-center gap-2 text-sage">
          <span className="size-1.5 animate-pulse rounded-full bg-sage" aria-hidden />
          RESPONSE SLA: &lt; 4 HOURS (ZURICH · NYC · LONDON)
        </span>
      </nav>

      {/* Editorial Header */}
      <header className="mb-12 border-b border-line pb-10 md:mb-16">
        <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
          DIRECT CLIENT & ARCHITECTURAL DESK {"//"} ZURICH · SOHO · MAYFAIR
        </p>
        <h1 className="mt-2 font-display text-[42px] leading-[1.04] text-ink sm:text-[58px] lg:text-[70px]">
          Private Client <em className="font-normal italic text-accent">Concierge.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
          Whether you are calibrating an acoustic listening room, tracking an international DHL
          Express DDP dispatch, or specifying custom travertine objects for an architectural project,
          our senior specialists respond directly — never via automated chatbots.
        </p>
      </header>

      {/* Split-Screen Grid */}
      <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-14">
        {/* LEFT COLUMN: Channels, 3 Flagship Listening Studios, 5-Question FAQ Accordion */}
        <div className="space-y-12 lg:col-span-6">
          {/* Direct Concierge Channels */}
          <section
            aria-labelledby="direct-channels-heading"
            className="rounded-[26px] border border-line-strong bg-surface p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <h2
                id="direct-channels-heading"
                className="font-mono text-[11px] font-semibold tracking-[0.18em] text-ink"
              >
                01 {"//"} DIRECT CONCIERGE CHANNELS
              </h2>
              <span className="rounded-full border border-sage/40 bg-sage/10 px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-sage">
                ● SLA &lt; 4 HOURS
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-canvas p-4">
                <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-muted">
                  <Mail className="size-3.5 text-accent" />
                  PRIVATE CLIENT DESK
                </p>
                <a
                  href="mailto:concierge@aetheria.studio"
                  className="mt-2 block font-mono text-[13px] font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  concierge@aetheria.studio
                </a>
                <p className="mt-1 text-[12px] text-muted">
                  Orders, acoustic calibration & warranty
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-canvas p-4">
                <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-muted">
                  <Building2 className="size-3.5 text-accent" />
                  ARCHITECTURAL TRADE
                </p>
                <a
                  href="mailto:trade@aetheria.studio"
                  className="mt-2 block font-mono text-[13px] font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  trade@aetheria.studio
                </a>
                <p className="mt-1 text-[12px] text-muted">
                  B2B volume allocation & custom stone
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3 font-mono text-[11px] text-ink">
              <span className="inline-flex items-center gap-2 text-muted">
                <Clock className="size-3.5 text-sage" />
                GLOBAL DESK HOURS:
              </span>
              <span>08:00 CET – 22:00 EST (7 DAYS)</span>
            </div>
          </section>

          {/* 3 Flagship Listening Studios */}
          <section aria-labelledby="listening-studios-heading">
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="listening-studios-heading"
                className="font-mono text-[11px] font-semibold tracking-[0.18em] text-ink"
              >
                02 {"//"} FLAGSHIP LISTENING STUDIOS
              </h2>
              <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
                3 SANCTUARIES WORLDWIDE
              </span>
            </div>

            <div className="space-y-4">
              {LISTENING_STUDIOS.map((studio) => (
                <article
                  key={studio.code}
                  className="rounded-[22px] border border-line-strong bg-surface p-5 transition-colors hover:border-ink/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-accent">
                      {studio.code}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-muted">
                      <Phone className="size-3 text-ink" />
                      {studio.phone}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-[24px] text-ink">{studio.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-ink">
                    <MapPin className="size-3.5 shrink-0 text-muted" />
                    {studio.address}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted">{studio.hours}</p>
                  <p className="mt-3 border-t border-line pt-2.5 font-mono text-[10.5px] tracking-wide text-sage">
                    ON DEMO: {studio.featured}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* 5-Question Tier-1 FAQ Accordion */}
          <section aria-labelledby="faq-accordion-heading">
            <div className="mb-5">
              <p className="font-mono text-[10.5px] tracking-[0.18em] text-muted">
                03 {"//"} TIER-1 TECHNICAL & LOGISTICS FAQ
              </p>
              <h2 id="faq-accordion-heading" className="mt-1 font-display text-[32px] text-ink">
                Frequently Asked by Collectors.
              </h2>
            </div>

            <div className="divide-y divide-line overflow-hidden rounded-[24px] border border-line-strong bg-surface">
              {TIER1_FAQS.map((faq, index) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="p-5">
                    <button
                      type="button"
                      data-testid={`faq-trigger-${index + 1}`}
                      aria-expanded={isOpen}
                      aria-controls={`${faq.id}-panel`}
                      onClick={() => setOpenFaqId(isOpen ? "" : faq.id)}
                      className="flex w-full items-start justify-between gap-4 text-left"
                    >
                      <span className="font-display text-[21px] leading-snug text-ink">
                        <span className="mr-2.5 font-mono text-[11px] text-accent">
                          0{index + 1}
                        </span>
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "mt-1 size-5 shrink-0 text-muted transition-transform duration-300",
                          isOpen && "rotate-180 text-accent",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div
                        id={`${faq.id}-panel`}
                        className="mt-3 pl-7 text-[14px] leading-relaxed text-muted"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Live Supabase Concierge Inquiry Form */}
        <div className="lg:col-span-6 lg:sticky lg:top-28">
          <section
            aria-labelledby="concierge-form-heading"
            className="rounded-[28px] border border-line-strong bg-surface p-6 shadow-[0_24px_60px_-28px_rgb(var(--shadow-tint)/0.28)] sm:p-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-accent">
                  LIVE SUPABASE DISPATCH LEDGER {"//"} PUBLIC.CONTACT_INQUIRIES
                </p>
                <h2
                  id="concierge-form-heading"
                  className="mt-1 font-display text-[32px] text-ink sm:text-[38px]"
                >
                  Commission a Concierge Dossier.
                </h2>
              </div>
              <span className="rounded-full border border-line-strong bg-canvas px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-ink">
                256-BIT TLS
              </span>
            </div>

            {ticketConfirmation ? (
              <div
                data-testid="concierge-ticket-confirmation"
                className="mt-8 rounded-2xl border border-sage/50 bg-canvas p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 font-mono text-[11px] font-semibold tracking-[0.18em] text-sage">
                  <CheckCircle2 className="size-5 shrink-0" />
                  <span>
                    TICKET #{ticketConfirmation.ticketNumber} LOGGED IN ARCHIVE
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[30px] leading-tight text-ink">
                  Your Inquiry Has Been Assigned to a Senior Specialist.
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                  We have recorded your message in the live AETHERIA Concierge Ledger and dispatched
                  a copy to{" "}
                  <span className="font-mono text-ink">{ticketConfirmation.email}</span>. Expect a
                  direct personal response within 4 hours.
                </p>

                <dl className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-4 font-mono text-[11px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">SERIALIZED TICKET:</dt>
                    <dd className="font-semibold text-ink">
                      #{ticketConfirmation.ticketNumber}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">CLIENT COLLECTOR:</dt>
                    <dd className="text-ink">{ticketConfirmation.fullName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">DEPARTMENT TOPIC:</dt>
                    <dd className="text-accent">{ticketConfirmation.subject}</dd>
                  </div>
                  {ticketConfirmation.orderReference && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">ORDER REFERENCE:</dt>
                      <dd className="text-ink">{ticketConfirmation.orderReference}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">PERSISTENCE MODE:</dt>
                    <dd className="text-sage uppercase">{ticketConfirmation.mode}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTicketConfirmation(null);
                      setMessage("");
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 font-mono text-[10.5px] tracking-[0.16em] text-ink transition-colors hover:border-ink"
                  >
                    SUBMIT ANOTHER INQUIRY
                  </button>
                  <Link
                    href="/shop"
                    className="inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-5 font-mono text-[10.5px] tracking-[0.16em] text-canvas transition-colors hover:bg-accent"
                  >
                    RETURN TO OBJECT ARCHIVE
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                data-testid="concierge-inquiry-form"
                className="mt-7 space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="concierge-full-name"
                      className="mb-2 block font-mono text-[10px] tracking-[0.18em] text-muted"
                    >
                      FULL NAME *
                    </label>
                    <input
                      id="concierge-full-name"
                      data-testid="concierge-input-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Julian Vance"
                      className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14.5px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="concierge-email"
                      className="mb-2 block font-mono text-[10px] tracking-[0.18em] text-muted"
                    >
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="concierge-email"
                      data-testid="concierge-input-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="julian.vance@aetheria.studio"
                      className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14.5px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="concierge-subject"
                      className="mb-2 block font-mono text-[10px] tracking-[0.18em] text-muted"
                    >
                      INQUIRY TOPIC *
                    </label>
                    <select
                      id="concierge-subject"
                      data-testid="concierge-select-subject"
                      value={subject}
                      onChange={(e) =>
                        setSubject(e.target.value as ConciergeInquiryTopic)
                      }
                      className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                    >
                      {TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="concierge-order-ref"
                      className="mb-2 block font-mono text-[10px] tracking-[0.18em] text-muted"
                    >
                      ORDER NUMBER (OPTIONAL)
                    </label>
                    <input
                      id="concierge-order-ref"
                      data-testid="concierge-input-order"
                      type="text"
                      value={orderReference}
                      onChange={(e) => setOrderReference(e.target.value)}
                      placeholder="AETH-2026-9213"
                      className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 font-mono text-[13px] tracking-wider text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="concierge-message"
                    className="mb-2 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    ARCHITECTURAL BRIEF OR INQUIRY DETAILS *
                  </label>
                  <textarea
                    id="concierge-message"
                    data-testid="concierge-input-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify room dimensions, acoustic requirements, order number, or trade project timeline…"
                    className="w-full rounded-xl border border-line-strong bg-canvas p-4 text-[14.5px] leading-relaxed text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
                  />
                </div>

                {errorMessage && (
                  <p
                    role="alert"
                    className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 font-mono text-[11.5px] text-accent"
                  >
                    × {errorMessage}
                  </p>
                )}

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 font-mono text-[10.5px] text-muted">
                    <ShieldCheck className="size-4 text-sage" />
                    <span>DIRECT ZURICH & SOHO DESK ROUTING</span>
                  </div>
                  <MagneticButton
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    data-testid="concierge-submit-btn"
                  >
                    {isPending ? (
                      "LOGGING IN ARCHIVE…"
                    ) : (
                      <>
                        Transmit to Concierge
                        <Send className="size-4" strokeWidth={1.75} />
                      </>
                    )}
                  </MagneticButton>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
