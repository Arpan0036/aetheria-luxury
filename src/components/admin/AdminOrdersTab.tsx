"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Eye, Search, X } from "lucide-react";
import { updateAdminOrderStatusAction } from "@/app/actions/admin";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderRecord, OrderStatus } from "@/types/database";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatDate(iso: string): string {
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

export function AdminOrdersTab({
  orders,
  onOrdersChange,
}: {
  orders: OrderRecord[];
  onOrdersChange: (next: OrderRecord[]) => void;
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectedOrder, setInspectedOrder] = useState<OrderRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!inspectedOrder) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setInspectedOrder(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectedOrder]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((ord) => {
      if (statusFilter !== "all" && ord.status !== statusFilter) return false;
      if (q) {
        const hay = `${ord.order_number} ${ord.customer_name} ${ord.customer_email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange = (ord: OrderRecord, nextStatus: OrderStatus) => {
    onOrdersChange(
      orders.map((o) => (o.id === ord.id ? { ...o, status: nextStatus } : o)),
    );
    if (inspectedOrder?.id === ord.id) {
      setInspectedOrder({ ...inspectedOrder, status: nextStatus });
    }

    startTransition(async () => {
      const res = await updateAdminOrderStatusAction(ord.id, nextStatus);
      if (res.ok) {
        setToastMsg(
          `✓ ORDER ${ord.order_number} STATUS UPDATED → '${res.status.toUpperCase()}' IN LIVE SUPABASE`,
        );
      } else if (res.error) {
        setToastMsg(`STATUS UPDATE ERROR: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-line bg-surface p-5 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter orders by status">
          {[
            { id: "all" as const, label: "All", count: orders.length },
            ...STATUS_OPTIONS.map((st) => ({
              id: st,
              label: st.charAt(0).toUpperCase() + st.slice(1),
              count: orders.filter((o) => o.status === st).length,
            })),
          ].map((pill) => {
            const active = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(pill.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 font-mono text-[10px] tracking-wider transition-colors",
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-canvas text-ink hover:border-line-strong",
                )}
              >
                <span>{pill.label.toUpperCase()}</span>
                <span className={cn("tabular", active ? "text-canvas/75" : "text-muted")}>
                  ({pill.count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            strokeWidth={1.75}
          />
          <label htmlFor="admin-order-search" className="sr-only">
            Search orders by number, collector name, or email
          </label>
          <input
            id="admin-order-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AETH-2026-XXXX, name, email…"
            className="h-10 w-full rounded-xl border border-line-strong bg-canvas pl-10 pr-4 text-[13px] text-ink outline-none focus:border-ink"
          />
        </div>
      </div>

      {/* Confirmation Toast */}
      {toastMsg && (
        <div
          role="status"
          data-testid="admin-orders-toast"
          className="flex items-center justify-between gap-3 rounded-2xl border border-sage/45 bg-sage/10 px-5 py-3 font-mono text-[10.5px] tracking-[0.15em] text-sage"
        >
          <span className="inline-flex items-center gap-2">
            <Check className="size-3.5" strokeWidth={2.2} />
            {toastMsg}
          </span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-ink hover:text-accent"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Order Management Cards / Rows */}
      <div className="rounded-[26px] border border-line bg-surface p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
          <span>
            SHOWING {filteredOrders.length} OF {orders.length} SERIALIZED ORDERS
          </span>
          <span>LIVE SUPABASE PUBLIC.ORDERS</span>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="py-8 text-center font-mono text-[11px] text-muted">
            NO ORDERS MATCH CURRENT FILTER.
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Order management list">
            {filteredOrders.map((ord) => {
              const addr = ord.shipping_address ?? {};
              const totalUnits = ord.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <li
                  key={ord.id}
                  className="flex flex-col justify-between gap-4 rounded-[20px] border border-line bg-canvas p-4 transition-colors hover:border-line-strong xl:flex-row xl:items-center"
                >
                  {/* Left: Order Number + Timestamp + Collector Name & City/Country */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full bg-ink px-3 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-canvas">
                        {ord.order_number}
                      </span>
                      <span className="font-mono text-[10px] tracking-wider text-muted">
                        {formatDate(ord.created_at)}
                      </span>
                      {addr.promo_code && (
                        <span className="rounded-full border border-sage/45 bg-sage/10 px-2.5 py-0.5 font-mono text-[9.5px] text-sage">
                          PROMO: {addr.promo_code}
                        </span>
                      )}
                    </div>
                    <p className="font-display text-[24px] leading-tight text-ink">
                      {ord.customer_name}{" "}
                      <span className="font-mono text-[11px] text-muted">
                        ({addr.city || "New York"}, {addr.country || "United States"})
                      </span>
                    </p>
                    <p className="font-mono text-[10px] tracking-wider text-muted">
                      {ord.customer_email} · {totalUnits}{" "}
                      {totalUnits === 1 ? "OBJECT" : "OBJECTS"}
                    </p>
                  </div>

                  {/* Right: Grand Total + Live Status Selector + Inspect Dossier + Live Tracking Link */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 xl:border-t-0 xl:pt-0">
                    <div className="text-right">
                      <p className="tabular font-mono text-[16px] font-semibold text-ink">
                        {formatPrice(ord.total_usd, currency)}
                      </p>
                      {ord.discount_usd > 0 && (
                        <p className="tabular font-mono text-[9.5px] text-sage">
                          −{formatPrice(ord.discount_usd, currency)} DISC
                        </p>
                      )}
                    </div>

                    {/* Interactive Live Status Selector */}
                    <div>
                      <label htmlFor={`order-status-${ord.order_number}`} className="sr-only">
                        Status for {ord.order_number}
                      </label>
                      <select
                        id={`order-status-${ord.order_number}`}
                        disabled={isPending}
                        value={ord.status}
                        onChange={(e) =>
                          handleStatusChange(ord, e.target.value as OrderStatus)
                        }
                        className="h-10 rounded-full border border-line-strong bg-surface px-3.5 font-mono text-[10.5px] font-medium uppercase tracking-wider text-ink outline-none focus:border-ink"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            STATUS: {st.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectedOrder(ord)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 font-mono text-[10px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                      >
                        <Eye className="size-3.5" strokeWidth={1.75} />
                        Inspect Dossier
                      </button>

                      <Link
                        href={`/order/${ord.id}`}
                        className="inline-flex h-10 items-center gap-1 rounded-full bg-ink px-3.5 font-mono text-[10px] font-medium tracking-wider text-canvas transition-colors hover:bg-accent"
                      >
                        Live Page <ArrowRight className="size-3" strokeWidth={1.75} />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Slide-Over Order Dossier Inspector */}
      <AnimatePresence>
        {inspectedOrder && (
          <motion.div
            key="order-dossier-inspector-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setInspectedOrder(null)}
            className="fixed inset-0 z-50 flex justify-end bg-[#0D0C0B]/55 backdrop-blur-sm"
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={`Order dossier ${inspectedOrder.order_number}`}
              data-lenis-prevent
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex h-dvh w-full max-w-[540px] flex-col border-l border-line-strong bg-canvas shadow-[-40px_0_100px_-30px_rgb(var(--shadow-tint)/0.65)]"
            >
              <header className="flex items-center justify-between border-b border-line px-6 py-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-accent">
                    ORDER DOSSIER INSPECTOR // {inspectedOrder.order_number}
                  </p>
                  <h2 className="mt-1 font-display text-[30px] leading-none text-ink">
                    {inspectedOrder.customer_name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  aria-label="Close order dossier inspector"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 font-mono text-[10px] tracking-wider text-ink"
                >
                  <span>ESC</span>
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              </header>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {/* Payment Authorization & Status */}
                <div className="rounded-2xl border border-line bg-surface p-4 font-mono text-[11px]">
                  <p className="text-[9.5px] tracking-[0.18em] text-muted">
                    01 // AUTHORIZATION &amp; TELEMETRY
                  </p>
                  <p className="mt-2 text-ink">
                    ORDER UUID: <span className="text-muted">{inspectedOrder.id}</span>
                  </p>
                  <p className="mt-1 text-ink">
                    AUTH ID:{" "}
                    <span className="text-muted">
                      {inspectedOrder.payment_intent_id ?? "sandbox_aeth_verified"}
                    </span>
                  </p>
                  <p className="mt-1 text-sage uppercase">
                    STATUS: ● {inspectedOrder.status}
                  </p>
                </div>

                {/* Shipping Address JSON Breakdown */}
                <div className="rounded-2xl border border-line bg-surface p-4 font-mono text-[11px]">
                  <p className="text-[9.5px] tracking-[0.18em] text-muted">
                    02 // SANCTUARY SHIPPING ADDRESS (JSONB)
                  </p>
                  <p className="mt-2 text-ink">
                    {inspectedOrder.shipping_address?.street || "412 Mercer St"}
                    {inspectedOrder.shipping_address?.apartment
                      ? `, ${inspectedOrder.shipping_address.apartment}`
                      : ""}
                  </p>
                  <p className="mt-0.5 text-ink">
                    {inspectedOrder.shipping_address?.city || "New York"},{" "}
                    {inspectedOrder.shipping_address?.state || "NY"}{" "}
                    {inspectedOrder.shipping_address?.postal_code || "10013"}
                  </p>
                  <p className="mt-0.5 text-muted">
                    {inspectedOrder.shipping_address?.country || "United States"} ·{" "}
                    {inspectedOrder.shipping_address?.phone || "+1 (212) 555-0194"}
                  </p>
                </div>

                {/* Itemized Order Items */}
                <div>
                  <p className="mb-2.5 font-mono text-[10px] tracking-[0.18em] text-muted">
                    03 // ITEMIZED ALLOCATION ({inspectedOrder.items.length} LINES)
                  </p>
                  <ul className="space-y-2.5">
                    {inspectedOrder.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-line bg-surface p-3.5"
                      >
                        <div>
                          <p className="font-display text-[21px] leading-tight text-ink">
                            {item.product_title}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] tracking-wider text-muted">
                            {(item.variant_name || "Standard Finish").toUpperCase()} · QTY{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <span className="tabular font-mono text-[14px] font-medium text-ink">
                          {formatPrice(item.unit_price_usd * item.quantity, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <footer className="border-t border-line bg-surface px-6 py-4">
                <Link
                  href={`/order/${inspectedOrder.id}`}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 font-mono text-[11px] font-medium tracking-wider text-canvas transition-colors hover:bg-accent"
                >
                  Open Live Tracking &amp; PDF Invoice →
                </Link>
              </footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
