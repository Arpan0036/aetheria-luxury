"use client";

import { useEffect, useId, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowUpRight, Check, PackageSearch } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/actions/engagement";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { scrollToTarget } from "@/components/motion/SmoothScrollProvider";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    title: "Collections",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "Spatial Audio", href: "/shop?category=spatial-audio" },
      { label: "Desk Architecture", href: "/shop?category=desk-architecture" },
      { label: "Tactile Computing", href: "/shop?category=tactile-computing" },
      { label: "Ambient Lighting", href: "/shop?category=ambient-lighting" },
    ],
  },
  {
    title: "Client Concierge",
    links: [
      { label: "About & Atelier", href: "/about" },
      { label: "Contact Concierge", href: "/contact" },
      { label: "Shipping & DDP", href: "/shipping-returns" },
      { label: "30-Day Returns", href: "/shipping-returns#return-protocol-heading" },
      { label: "Track Order", href: "/order/latest" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Sale", href: "/terms" },
      { label: "GDPR / CCPA", href: "/privacy#gdpr-uk-dpa" },
      { label: "10-Year Warranty", href: "/terms#payment-encryption-cookies" },
      { label: "Collector Portal", href: "/account" },
    ],
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [joined, setJoined] = useState(false);
  const [duplicateMsg, setDuplicateMsg] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const valid = EMAIL_RE.test(email.trim());
  const state = duplicateMsg
    ? "duplicate"
    : joined
      ? "joined"
      : !touched || !email
        ? "idle"
        : valid
          ? "valid"
          : "invalid";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setDuplicateMsg(null);
    if (!valid || isPending) return;

    startTransition(async () => {
      const res = await subscribeNewsletterAction(email.trim(), "footer");
      if (!res.ok) {
        setStatusMessage(res.message);
        return;
      }
      if (res.alreadySubscribed) {
        setDuplicateMsg(res.message);
        setStatusMessage(res.message);
      } else {
        setJoined(true);
        setStatusMessage(res.message);
      }
    });
  };

  const badge = {
    idle: { text: "AWAITING INPUT", cls: "text-muted border-line" },
    valid: { text: "✓ FORMAT VALID", cls: "text-sage border-sage/40" },
    invalid: { text: "× CHECK FORMAT", cls: "text-accent border-accent/40" },
    joined: { text: "● ARCHIVE ACCESS GRANTED", cls: "text-sage border-sage/40" },
    duplicate: {
      text: "● ALREADY ON THE PRIVATE ARCHIVE LIST",
      cls: "text-accent border-accent/40",
    },
  }[state];

  return (
    <form onSubmit={onSubmit} noValidate className="w-full" data-testid="footer-newsletter-form">
      <label
        htmlFor={`${id}-email`}
        className="mb-3 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] text-muted"
      >
        <span>EMAIL ADDRESS</span>
        <span
          aria-live="polite"
          id={`${id}-status`}
          data-testid="footer-newsletter-status"
          className={cn("rounded-full border px-2 py-0.5 transition-colors", badge.cls)}
        >
          {badge.text}
        </span>
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id={`${id}-email`}
          data-testid="footer-newsletter-input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          disabled={isPending}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (joined) setJoined(false);
            if (duplicateMsg) setDuplicateMsg(null);
          }}
          onBlur={() => setTouched(true)}
          aria-invalid={state === "invalid"}
          aria-describedby={`${id}-status`}
          placeholder="you@studio.com"
          className="h-14 min-w-0 flex-1 rounded-full border border-line-strong bg-canvas px-6 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink disabled:opacity-60"
        />
        <MagneticButton
          type="submit"
          size="lg"
          disabled={isPending}
          data-testid="footer-newsletter-submit"
          className="shrink-0"
        >
          {isPending ? (
            "Recording…"
          ) : joined ? (
            <>
              Welcome <Check className="size-4" strokeWidth={2} />
            </>
          ) : (
            <>
              Request Access <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </>
          )}
        </MagneticButton>
      </div>
      {statusMessage ? (
        <p
          data-testid="footer-newsletter-feedback"
          className={cn(
            "mt-3 font-mono text-[11px] tracking-[0.12em]",
            duplicateMsg ? "text-accent" : "text-sage",
          )}
        >
          {statusMessage}
        </p>
      ) : (
        <p className="mt-3 text-[12px] text-muted">
          Quarterly dispatches. Early access to numbered editions. Unsubscribe in one click.
        </p>
      )}
    </form>
  );
}

function LocalClock() {
  const [clock, setClock] = useState<{ time: string; zone: string } | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ");
    const tick = () => setClock({ time: fmt.format(new Date()), zone });
    const init = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(init);
      clearInterval(t);
    };
  }, []);
  return (
    <span className="tabular font-mono">
      <span className="mr-2 inline-block size-1.5 -translate-y-px animate-pulse rounded-full bg-sage" aria-hidden />
      {clock?.time ?? "--:--:--"} <span className="text-muted">{clock?.zone ? `· ${clock.zone.toUpperCase()}` : ""}</span>
    </span>
  );
}

function QuickOrderLookup() {
  const router = useRouter();
  const [orderRef, setOrderRef] = useState("");

  const handleLookup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = orderRef.trim();
    router.push(`/order/${encodeURIComponent(clean || "latest")}`);
  };

  return (
    <form onSubmit={handleLookup} className="mt-5">
      <label
        htmlFor="footer-order-lookup"
        className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.18em] text-muted"
      >
        <PackageSearch className="size-3 text-accent" strokeWidth={1.75} />
        TRACK SERIALIZED ORDER
      </label>
      <div className="flex gap-1.5">
        <input
          id="footer-order-lookup"
          type="text"
          value={orderRef}
          onChange={(e) => setOrderRef(e.target.value)}
          placeholder="AETH-2026-XXXX"
          className="h-9 min-w-0 flex-1 rounded-full border border-line-strong bg-canvas px-3.5 font-mono text-[10.5px] tracking-wider text-ink outline-none focus:border-ink"
        />
        <button
          type="submit"
          className="h-9 shrink-0 rounded-full bg-ink px-3.5 font-mono text-[10px] font-medium tracking-wider text-canvas transition-colors hover:bg-accent"
        >
          Track →
        </button>
      </div>
    </form>
  );
}

export function Footer() {
  return (
    <footer id="footer" className="relative mt-24 overflow-hidden border-t border-line bg-surface md:mt-32">
      {/* Newsletter */}
      <section className="mx-auto grid max-w-[1600px] gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <p className="mb-5 font-mono text-[10.5px] tracking-[0.2em] text-muted">VIP CLUB — Nº 0001 / 2026</p>
          <h2 className="font-display text-[44px] text-ink sm:text-[56px] lg:text-[76px]">
            Join the Private <em className="text-accent">Object</em> Archive
          </h2>
        </div>
        <div className="flex items-end">
          <NewsletterForm />
        </div>
      </section>

      {/* Sitemap */}
      <section className="mx-auto max-w-[1600px] border-t border-line px-5 py-14 md:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-5 font-mono text-[10.5px] tracking-[0.18em] text-muted">{col.title.toUpperCase()}</h3>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-9 items-center text-[14px] text-ink transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-5 font-mono text-[10.5px] tracking-[0.18em] text-muted">ARCHITECTURE</h3>
            <p className="text-[14px] leading-relaxed text-ink">
              Zero-Rent Headless Stack
              <br />
              <span className="text-muted">Next.js + Supabase + WebGL</span>
            </p>
            <QuickOrderLookup />
            <ul className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] tracking-wider">
              {["CARBON-NEUTRAL SHIPPING", "2-YR WARRANTY", "SECURE CHECKOUT"].map((t) => (
                <li key={t} className="rounded-full border border-sage/35 px-2.5 py-1 text-sage">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Watermark + base bar */}
      <section className="relative border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-5 font-mono text-[10.5px] tracking-wider text-muted sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>© 2026 AETHERIA OBJECTS LTD. ALL RIGHTS RESERVED.</span>
          <span className="text-ink">
            LOCAL TIME — <LocalClock />
          </span>
          <button
            onClick={() => scrollToTarget(0)}
            className="group inline-flex min-h-11 items-center gap-2 self-start text-ink transition-colors hover:text-accent sm:self-auto"
          >
            BACK TO TOP
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-line-strong transition-transform duration-500 group-hover:-translate-y-1">
              <ArrowUp className="size-3.5" strokeWidth={1.5} />
            </span>
          </button>
        </div>
        <div aria-hidden className="pointer-events-none select-none [container-type:inline-size]">
          <p className="font-display translate-y-[18%] whitespace-nowrap text-center text-[23.5cqw] leading-[0.8] text-ink/[0.92]">
            AETHERIA
          </p>
        </div>
      </section>
    </footer>
  );
}
