"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  FileText,
  PackageCheck,
  Plane,
  Printer,
  Radio,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { updateOrderStatusAction } from "@/app/actions/orders";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderRecord, OrderStatus } from "@/types/database";

const PIPELINE_STAGES = [
  {
    index: "01",
    code: "01 // ORDER AUTHORIZED",
    subtitle: "Payment verified & serialized stock locked in Supabase",
    icon: ShieldCheck,
  },
  {
    index: "02",
    code: "02 // ACOUSTIC & QC CALIBRATION",
    subtitle: "Zurich / Copenhagen Studio individual bench calibration",
    icon: Wrench,
  },
  {
    index: "03",
    code: "03 // INSURED DHL AIR DISPATCH",
    subtitle: "Tracking: DHL-AETH-8849201 · DDP Customs Cleared",
    icon: Plane,
  },
  {
    index: "04",
    code: "04 // DELIVERED TO SANCTUARY",
    subtitle: "Signed reception at collector destination",
    icon: PackageCheck,
  },
] as const;

const SIMULATOR_OPTIONS: { status: OrderStatus; label: string }[] = [
  { status: "processing", label: "[ Set: Processing ]" },
  { status: "shipped", label: "[ Set: Shipped ]" },
  { status: "delivered", label: "[ Set: Delivered ]" },
];

function getActiveStageIndex(status: OrderStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return 1;
  }
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "NOV 18, 2026";
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .toUpperCase();
  } catch {
    return "NOV 18, 2026";
  }
}

export function OrderConfirmationClient({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updatedAt, setUpdatedAt] = useState<string>(order.updated_at);
  const [lookupInput, setLookupInput] = useState("");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isUpdating, startTransition] = useTransition();

  const activeStageIdx = getActiveStageIndex(status);
  const progressPct = Math.round(((activeStageIdx + 1) / PIPELINE_STAGES.length) * 100);
  const addr = order.shipping_address ?? {};
  const trackingCode = `DHL-AETH-${order.order_number.slice(-4)}201`;

  const handleSimulateStatus = (nextStatus: OrderStatus) => {
    setStatus(nextStatus);
    setStatusNotice(null);
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, order.order_number, nextStatus);
      if (res.ok) {
        setStatus(res.status);
        setUpdatedAt(res.updatedAt);
        setStatusNotice(
          `LIVE SUPABASE PUBLIC.ORDERS.STATUS UPDATED → '${res.status.toUpperCase()}'`,
        );
      } else if (res.error) {
        setStatusNotice(`STATUS UPDATE ERROR: ${res.error}`);
      }
    });
  };

  const handleOrderLookup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = lookupInput.trim();
    if (!clean) return;
    router.push(`/order/${encodeURIComponent(clean)}`);
  };

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-6 md:px-8 md:pb-32 md:pt-10">
      {/* 3.1 Confirmation Header & Quick Order Lookup Bar */}
      <header className="no-print mb-10 border-b border-line pb-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage/45 bg-sage/10 px-4 py-1.5 font-mono text-[10.5px] font-medium tracking-[0.16em] text-sage">
            <Check className="size-3.5" strokeWidth={2.2} />
            ✓ DISPATCH AUTHORIZED // LIVE SUPABASE RECORD CONFIRMED
          </span>

          {/* Quick Order Lookup Form */}
          <form onSubmit={handleOrderLookup} className="flex items-center gap-2">
            <label htmlFor="order-lookup-input" className="sr-only">
              Lookup order by AETH-2026-XXXX or UUID
            </label>
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-3 size-3.5 text-muted"
                strokeWidth={1.75}
              />
              <input
                id="order-lookup-input"
                type="text"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Track AETH-2026-XXXX…"
                className="h-9 rounded-full border border-line-strong bg-surface pl-8 pr-3 font-mono text-[10.5px] tracking-wider text-ink outline-none focus:border-ink"
              />
            </div>
            <button
              type="submit"
              className="h-9 rounded-full border border-line-strong bg-canvas px-3.5 font-mono text-[10px] tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
            >
              LOOKUP →
            </button>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
              SERIALIZED ORDER DOSSIER // {order.order_number} · {formatTimestamp(order.created_at)}
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.5rem,4.8vw,4.5rem)] leading-[1.02] text-ink">
              Thank You, <em className="text-accent">{order.customer_name}.</em>
            </h1>
            <p className="mt-2.5 max-w-[42rem] text-[14.5px] leading-relaxed text-muted">
              A copy of your commercial tax invoice and live telemetry credentials has been
              registered for <strong className="text-ink">{order.customer_email}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MagneticButton size="md" variant="primary" onClick={handlePrintInvoice}>
              <Printer className="size-4" strokeWidth={1.75} />
              Download / Print Official Tax Invoice (PDF)
            </MagneticButton>

            <Link
              href="/account"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 font-mono text-[11px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
            >
              View in Collector Portal (/account) <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>

            <Link
              href="/shop"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-canvas px-5 font-mono text-[11px] font-medium tracking-wider text-muted transition-colors hover:border-ink hover:text-ink"
            >
              Continue Exploring Archive <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </header>

      {/* Interactive 4-Stage Visual Shipment Telemetry Pipeline + Live Status Simulator */}
      <section
        aria-label="Live Shipment Telemetry Pipeline"
        className="no-print mb-12 rounded-[28px] border border-line-strong bg-surface p-6 shadow-[0_32px_70px_-38px_rgb(var(--shadow-tint)/0.5)] md:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-accent">
              <Radio className="size-3.5 animate-pulse" strokeWidth={1.75} />
              LIVE SHIPMENT TELEMETRY PIPELINE // WAYBILL {trackingCode}
            </p>
            <h2 className="mt-1 font-display text-[32px] leading-none text-ink">
              Dispatch Status:{" "}
              <em className="capitalize text-accent">{status}</em>
            </h2>
          </div>

          {/* Interactive "Simulate Live Status Progression" Demo Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-canvas p-2">
            <span className="px-2 font-mono text-[9.5px] tracking-[0.16em] text-muted">
              SIMULATE LIVE STATUS PROGRESSION:
            </span>
            {SIMULATOR_OPTIONS.map((opt) => {
              const active = status === opt.status;
              return (
                <button
                  key={opt.status}
                  type="button"
                  disabled={isUpdating}
                  aria-pressed={active}
                  onClick={() => handleSimulateStatus(opt.status)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 font-mono text-[10px] font-medium tracking-wider transition-all",
                    active
                      ? "border-ink bg-ink text-canvas shadow-sm"
                      : "border-line-strong bg-surface text-ink hover:border-ink",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {statusNotice && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-sage/45 bg-sage/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] text-sage"
          >
            ✓ {statusNotice} · {formatTimestamp(updatedAt)}
          </div>
        )}

        {/* Animated Progress Bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-muted">
            <span>ZURICH / COPENHAGEN ATELIER → {addr.city?.toUpperCase() || "NEW YORK"}</span>
            <span className="tabular text-ink">{progressPct}% COMPLETE</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
            <motion.div
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
              className={cn(
                "h-full rounded-full transition-colors",
                status === "delivered" ? "bg-sage" : "bg-accent",
              )}
            />
          </div>
        </div>

        {/* 4 Telemetry Stage Cards */}
        <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < activeStageIdx || status === "delivered";
            const isCurrent = idx === activeStageIdx && status !== "delivered";
            return (
              <li
                key={stage.code}
                className={cn(
                  "flex flex-col justify-between rounded-2xl border p-4 transition-all",
                  isCurrent
                    ? "border-accent bg-canvas shadow-sm ring-1 ring-accent/25"
                    : isCompleted
                      ? "border-sage/45 bg-canvas/85"
                      : "border-line bg-canvas/45 opacity-60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-xl border",
                      isCurrent
                        ? "border-accent bg-accent text-accent-on"
                        : isCompleted
                          ? "border-sage/45 bg-sage/15 text-sage"
                          : "border-line bg-surface text-muted",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4" strokeWidth={2.2} />
                    ) : (
                      <Icon className="size-4" strokeWidth={1.75} />
                    )}
                  </span>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 font-mono text-[9px] tracking-wider",
                      isCurrent
                        ? "bg-accent/15 text-accent"
                        : isCompleted
                          ? "bg-sage/15 text-sage"
                          : "bg-surface text-muted",
                    )}
                  >
                    {isCurrent ? "ACTIVE STAGE" : isCompleted ? "COMPLETED" : "QUEUED"}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-ink">
                    {stage.code}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{stage.subtitle}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 3.2 Printable / Downloadable Architectural Tax Invoice (PDF Generator) */}
      <section
        id="official-tax-invoice"
        aria-label="Official Commercial and DDP Tax Invoice"
        className="rounded-[28px] border border-line-strong bg-canvas p-6 shadow-[0_32px_70px_-40px_rgb(var(--shadow-tint)/0.5)] md:p-10"
      >
        {/* Top Invoice Masthead */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-7">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-muted">
              <FileText className="size-3.5 text-accent" strokeWidth={1.75} />
              AETHERIA ARCHIVE HOLDINGS — OFFICIAL COMMERCIAL &amp; DDP TAX INVOICE
            </p>
            <h2 className="mt-2 font-display text-[36px] leading-none text-ink sm:text-[44px]">
              AETHERIA<sup className="ml-0.5 text-[14px]">®</sup>{" "}
              <span className="font-mono text-[13px] tracking-[0.18em] text-muted">
                ZURICH · LONDON · NEW YORK
              </span>
            </h2>
            <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-muted">
              CHE-419.882.710 MWST · EXPORT DDP CUSTOMS CLEARANCE CERTIFICATE
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-sage bg-sage/10 px-4 py-1 font-mono text-[11px] font-semibold tracking-[0.2em] text-sage">
              <Check className="size-3.5" strokeWidth={2.5} />
              PAID IN FULL
            </span>
            <p className="tabular font-mono text-[11px] tracking-[0.14em] text-ink">
              INVOICE NO: <strong>{order.order_number}</strong>
            </p>
            <p className="tabular font-mono text-[10px] tracking-[0.14em] text-muted">
              AUTH ID: {order.payment_intent_id ?? `sandbox_aeth_${order.id.slice(0, 8)}`}
            </p>
          </div>
        </div>

        {/* Buyer Dossier / Shipping Destination / Telemetry Metadata Grid */}
        <div className="my-7 grid grid-cols-1 gap-6 border-b border-line pb-7 sm:grid-cols-3 font-mono text-[11px]">
          <div>
            <p className="text-[9.5px] tracking-[0.18em] text-muted">
              01 // BILLED &amp; CONSIGNED TO
            </p>
            <p className="mt-2 font-sans text-[15px] font-semibold text-ink">
              {order.customer_name}
            </p>
            <p className="mt-0.5 text-muted">{order.customer_email}</p>
            {addr.phone && <p className="mt-0.5 text-muted">{addr.phone}</p>}
          </div>

          <div>
            <p className="text-[9.5px] tracking-[0.18em] text-muted">
              02 // SANCTUARY DELIVERY DESTINATION
            </p>
            <p className="mt-2 text-ink">
              {addr.street || "412 Mercer St"}
              {addr.apartment ? `, ${addr.apartment}` : ""}
            </p>
            <p className="mt-0.5 text-ink">
              {addr.city || "New York"}, {addr.state || "NY"} {addr.postal_code || "10013"}
            </p>
            <p className="mt-0.5 text-muted">{addr.country || "United States"}</p>
          </div>

          <div>
            <p className="text-[9.5px] tracking-[0.18em] text-muted">
              03 // DISPATCH &amp; SETTLEMENT LEDGER
            </p>
            <p className="mt-2 text-ink">
              TIER:{" "}
              {addr.shipping_tier === "white-glove"
                ? "WHITE-GLOVE FLIGHT CASE"
                : "DHL EXPRESS DDP AIR"}
            </p>
            <p className="mt-0.5 text-ink">
              CARD: •••• {addr.card_last4 || "4242"} ({(addr.payment_method || "SANDBOX").toUpperCase()})
            </p>
            <p className="mt-0.5 text-sage">RECORD ID: {order.id.slice(0, 13)}…</p>
          </div>
        </div>

        {/* Itemized SKU & Variant Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[11.5px]">
            <thead>
              <tr className="border-b border-line text-[10px] tracking-[0.18em] text-muted">
                <th className="pb-3 pr-4">ITEM &amp; ARCHITECTURAL FINISH</th>
                <th className="pb-3 px-4">VARIANT SPECIFICATION</th>
                <th className="pb-3 px-4 text-right">QTY</th>
                <th className="pb-3 px-4 text-right">UNIT VALUATION</th>
                <th className="pb-3 pl-4 text-right">LINE TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 pr-4 font-sans text-[14.5px] font-medium text-ink">
                    {item.product_title}
                  </td>
                  <td className="py-4 px-4 text-muted">
                    {(item.variant_name || "Standard Archive Finish").toUpperCase()}
                  </td>
                  <td className="tabular py-4 px-4 text-right text-ink">
                    {String(item.quantity).padStart(2, "0")}
                  </td>
                  <td className="tabular py-4 px-4 text-right text-muted">
                    {formatPrice(item.unit_price_usd, order.currency)}
                  </td>
                  <td className="tabular py-4 pl-4 text-right font-medium text-ink">
                    {formatPrice(item.unit_price_usd * item.quantity, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Invoice Totals & Seal */}
        <div className="mt-7 flex flex-col justify-between gap-6 border-t border-line pt-6 sm:flex-row sm:items-end">
          <div className="max-w-[26rem] space-y-2">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted">
              CERTIFIED ZERO-RENT ARCHITECTURAL HARDWARE · 10-YEAR CHASSIS GUARANTEE
            </p>
            <p className="text-[12.5px] leading-relaxed text-muted">
              This commercial invoice certifies Delivered Duty Paid (DDP) clearance and serialized
              collector ownership in the AETHERIA permanent archive.
            </p>
          </div>

          <dl className="w-full max-w-[340px] space-y-2 font-mono text-[11.5px] tracking-[0.14em]">
            <div className="flex justify-between text-muted">
              <dt>ARCHIVE SUBTOTAL</dt>
              <dd className="tabular text-ink">
                {formatPrice(order.subtotal_usd, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between text-sage">
              <dt>
                PRIVILEGE DISCOUNT
                {addr.promo_code ? ` (${addr.promo_code})` : ""}
              </dt>
              <dd className="tabular">
                −{formatPrice(order.discount_usd, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>INSURED AIR DISPATCH</dt>
              <dd className="tabular text-ink">
                {order.shipping_usd === 0
                  ? "COMPLIMENTARY"
                  : formatPrice(order.shipping_usd, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2.5 text-[14px] font-semibold text-ink">
              <dt>TOTAL PAID ({order.currency})</dt>
              <dd className="tabular">{formatPrice(order.total_usd, order.currency)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
