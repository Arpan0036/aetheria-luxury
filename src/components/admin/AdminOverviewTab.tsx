"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { Tilt3DCard } from "@/components/motion/Tilt3DCard";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type {
  CatalogProduct,
  Category,
  CategorySlug,
  OrderRecord,
  OrderStatus,
} from "@/types/database";

const CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

const PIPELINE_STATUSES: { status: OrderStatus; label: string; colorClass: string }[] = [
  { status: "pending", label: "Pending Authorization", colorClass: "bg-muted" },
  { status: "processing", label: "Processing & QC Calibration", colorClass: "bg-accent" },
  { status: "shipped", label: "Insured DHL Air Dispatch", colorClass: "bg-ink" },
  { status: "delivered", label: "Delivered to Sanctuary", colorClass: "bg-sage" },
];

export function AdminOverviewTab({
  categories,
  products,
  orders,
  onJumpToTab,
}: {
  categories: Category[];
  products: CatalogProduct[];
  orders: OrderRecord[];
  onJumpToTab: (tab: "overview" | "products" | "orders" | "discounts") => void;
}) {
  const currency = useUIStore((s) => s.activeCurrency);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    const grossRevenueUsd = activeOrders.reduce((sum, o) => sum + o.total_usd, 0);
    const aovUsd = activeOrders.length > 0 ? grossRevenueUsd / activeOrders.length : 0;

    const processingCount = orders.filter((o) => o.status === "processing").length;
    const shippedCount = orders.filter((o) => o.status === "shipped").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    const pendingCount = orders.filter((o) => o.status === "pending").length;

    const totalStockUnits = products.reduce((sum, p) => sum + p.stock_count, 0);
    const lowStockProducts = products.filter((p) => p.stock_count <= 10);
    const criticalStockProducts = products.filter((p) => p.stock_count <= 5);

    return {
      grossRevenueUsd,
      aovUsd,
      totalOrders: orders.length,
      processingCount,
      shippedCount,
      deliveredCount,
      pendingCount,
      totalStockUnits,
      lowStockProducts,
      criticalStockProducts,
    };
  }, [orders, products]);

  // Chart A: Revenue & Inventory Valuation by Architectural Category
  const categoryBreakdown = useMemo(() => {
    const productById = new Map(products.map((p) => [p.id, p]));
    const rows = categories.map((cat) => {
      const catProducts = products.filter((p) => p.category_id === cat.id);
      const inventoryValuationUsd = catProducts.reduce(
        (sum, p) => sum + p.price_usd * Math.max(1, p.stock_count),
        0,
      );
      let salesRevenueUsd = 0;
      for (const ord of orders) {
        for (const item of ord.items) {
          const prod = productById.get(item.product_id);
          if (prod && prod.category_id === cat.id) {
            salesRevenueUsd += item.unit_price_usd * item.quantity;
          }
        }
      }
      return {
        id: cat.id,
        slug: cat.slug,
        label: CATEGORY_SHORT_LABELS[cat.slug] ?? cat.name,
        objectCount: catProducts.length,
        inventoryValuationUsd,
        salesRevenueUsd,
      };
    });

    const maxValuation = Math.max(1, ...rows.map((r) => r.inventoryValuationUsd));
    return rows.map((r) => ({
      ...r,
      barPct: Math.max(12, Math.round((r.inventoryValuationUsd / maxValuation) * 100)),
    }));
  }, [categories, products, orders]);

  const recentDispatches = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 2.1 Four Spatial 3D KPI Metric Cards (Tilt3DCard) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: GROSS ARCHIVE REVENUE */}
        <Tilt3DCard maxTilt={6}>
          <article className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">
                01 // GROSS ARCHIVE REVENUE
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-xl border border-line bg-canvas text-accent">
                <DollarSign className="size-4" strokeWidth={1.75} />
              </span>
            </div>
            <div className="my-4">
              <p
                data-testid="kpi-gross-revenue"
                className="tabular font-display text-[42px] leading-none text-ink"
              >
                {formatPrice(metrics.grossRevenueUsd, currency)}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.15em] text-sage">
                ● {metrics.totalOrders} SERIALIZED{" "}
                {metrics.totalOrders === 1 ? "DISPATCH" : "DISPATCHES"} RECORDED
              </p>
            </div>
            <div className="border-t border-line pt-3 font-mono text-[9.5px] tracking-wider text-muted">
              LIVE SUPABASE PUBLIC.ORDERS LEDGER
            </div>
          </article>
        </Tilt3DCard>

        {/* Card 2: ACTIVE DISPATCHES */}
        <Tilt3DCard maxTilt={6}>
          <article className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">
                02 // ACTIVE DISPATCHES
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-xl border border-line bg-canvas text-ink">
                <Package className="size-4" strokeWidth={1.75} />
              </span>
            </div>
            <div className="my-4">
              <p
                data-testid="kpi-active-dispatches"
                className="tabular font-display text-[42px] leading-none text-ink"
              >
                {String(metrics.totalOrders).padStart(2, "0")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 font-mono text-[9.5px] tracking-wider">
                <span className="rounded-full bg-canvas px-2 py-0.5 text-accent">
                  {metrics.processingCount} PROC
                </span>
                <span className="rounded-full bg-canvas px-2 py-0.5 text-ink">
                  {metrics.shippedCount} SHIP
                </span>
                <span className="rounded-full bg-canvas px-2 py-0.5 text-sage">
                  {metrics.deliveredCount} DELIV
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onJumpToTab("orders")}
              className="border-t border-line pt-3 text-left font-mono text-[9.5px] tracking-wider text-accent hover:text-ink"
            >
              OPEN DISPATCH BOARD →
            </button>
          </article>
        </Tilt3DCard>

        {/* Card 3: AVERAGE COLLECTOR ORDER (AOV) */}
        <Tilt3DCard maxTilt={6}>
          <article className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">
                03 // AVERAGE COLLECTOR AOV
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-xl border border-line bg-canvas text-sage">
                <TrendingUp className="size-4" strokeWidth={1.75} />
              </span>
            </div>
            <div className="my-4">
              <p
                data-testid="kpi-aov"
                className="tabular font-display text-[42px] leading-none text-ink"
              >
                {formatPrice(metrics.aovUsd, currency)}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.15em] text-muted">
                TIER-1 DDP BASKET VALUATION
              </p>
            </div>
            <div className="border-t border-line pt-3 font-mono text-[9.5px] tracking-wider text-sage">
              ✓ 100% INSURED AIR COURIER
            </div>
          </article>
        </Tilt3DCard>

        {/* Card 4: CATALOG & STOCK HEALTH */}
        <Tilt3DCard maxTilt={6}>
          <article className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">
                04 // CATALOG &amp; STOCK HEALTH
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-xl border border-line bg-canvas text-ink">
                <Boxes className="size-4" strokeWidth={1.75} />
              </span>
            </div>
            <div className="my-4">
              <p
                data-testid="kpi-catalog-count"
                className="tabular font-display text-[42px] leading-none text-ink"
              >
                {products.length}{" "}
                <span className="font-mono text-[14px] text-muted">
                  OBJECTS ({metrics.totalStockUnits} UNITS)
                </span>
              </p>
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em]",
                  metrics.criticalStockProducts.length > 0 ? "text-accent" : "text-sage",
                )}
              >
                {metrics.criticalStockProducts.length > 0 ? (
                  <>
                    <AlertTriangle className="size-3.5" strokeWidth={2} />
                    {metrics.criticalStockProducts.length} LOW-STOCK ALERT (≤ 5 UNITS)
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" strokeWidth={2} />
                    ALL 12 ARCHIVE SKUS HEALTHY
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onJumpToTab("products")}
              className="border-t border-line pt-3 text-left font-mono text-[9.5px] tracking-wider text-accent hover:text-ink"
            >
              MANAGE INVENTORY &amp; STOCK →
            </button>
          </article>
        </Tilt3DCard>
      </div>

      {/* 2.2 Editorial Revenue & Category Distribution Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Chart A: Revenue & Inventory Valuation by Architectural Category */}
        <section
          aria-label="Revenue by Architectural Category"
          className="rounded-[26px] border border-line bg-surface p-6 lg:col-span-7"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
                CHART A // ARCHITECTURAL DEPARTMENT ALLOCATION
              </p>
              <h2 className="mt-1 font-display text-[28px] leading-none text-ink">
                Archive Valuation &amp; Sales by Department
              </h2>
            </div>
            <BarChart3 className="size-5 text-muted" strokeWidth={1.6} />
          </div>

          <ul className="space-y-4">
            {categoryBreakdown.map((row, idx) => (
              <li key={row.id} className="rounded-2xl border border-line bg-canvas p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-muted">
                      0{idx + 1}
                    </span>
                    <span className="font-display text-[22px] leading-none text-ink">
                      {row.label}
                    </span>
                    <span className="rounded-full bg-surface px-2.5 py-0.5 font-mono text-[9.5px] text-muted">
                      {row.objectCount} OBJECTS
                    </span>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-muted">SALES: </span>
                    <strong className="tabular text-sage">
                      {formatPrice(row.salesRevenueUsd, currency)}
                    </strong>
                    <span className="mx-2 text-line-strong">|</span>
                    <span className="text-muted">ARCHIVE STOCK: </span>
                    <strong className="tabular text-ink">
                      {formatPrice(row.inventoryValuationUsd, currency)}
                    </strong>
                  </div>
                </div>

                {/* Pure SVG + Framer Motion Horizontal Architectural Bar */}
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.barPct}%` }}
                    transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-ink"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Chart B: Order Pipeline & Velocity Breakdown */}
        <section
          aria-label="Order Pipeline and Velocity Breakdown"
          className="flex flex-col justify-between rounded-[26px] border border-line bg-surface p-6 lg:col-span-5"
        >
          <div>
            <div className="mb-6 border-b border-line pb-4">
              <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
                CHART B // DISPATCH TELEMETRY PIPELINE
              </p>
              <h2 className="mt-1 font-display text-[28px] leading-none text-ink">
                Order Velocity Breakdown
              </h2>
            </div>

            <ul className="space-y-3.5">
              {PIPELINE_STATUSES.map((st) => {
                const count = orders.filter((o) => o.status === st.status).length;
                const pct =
                  orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <li key={st.status} className="rounded-2xl border border-line bg-canvas p-3.5">
                    <div className="flex items-center justify-between font-mono text-[10.5px]">
                      <span className="uppercase tracking-wider text-ink">{st.label}</span>
                      <span className="tabular text-muted">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(count > 0 ? 14 : 0, pct)}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={cn("h-full rounded-full", st.colorClass)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Low-Stock Watchlist */}
          <div className="mt-6 rounded-2xl border border-line bg-canvas p-4">
            <p className="font-mono text-[9.5px] tracking-[0.18em] text-muted">
              LOWEST STOCK ALLOCATIONS IN ARCHIVE
            </p>
            <ul className="mt-2.5 divide-y divide-line font-mono text-[11px]">
              {[...products]
                .sort((a, b) => a.stock_count - b.stock_count)
                .slice(0, 3)
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2">
                    <span className="truncate pr-2 text-ink">{p.title}</span>
                    <span
                      className={cn(
                        "tabular shrink-0 rounded-full px-2.5 py-0.5 text-[10px]",
                        p.stock_count <= 10
                          ? "bg-accent/15 text-accent"
                          : "bg-surface text-muted",
                      )}
                    >
                      {p.stock_count} UNITS
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </div>

      {/* 2.3 Recent Live Dispatches Feed */}
      <section
        aria-label="Recent Live Dispatches Feed"
        className="rounded-[26px] border border-line bg-surface p-6"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
              LIVE SUPABASE PUBLIC.ORDERS // 5 MOST RECENT DISPATCHES
            </p>
            <h2 className="mt-1 font-display text-[28px] leading-none text-ink">
              Recent Collector Dispatches
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onJumpToTab("orders")}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-4 py-1.5 font-mono text-[10.5px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
          >
            View All Orders ({orders.length}) <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {recentDispatches.length === 0 ? (
          <p className="py-6 text-center font-mono text-[11px] text-muted">
            NO DISPATCHES RECORDED YET — PLACE A TEST ORDER ON /CHECKOUT.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-[11.5px]">
              <thead>
                <tr className="border-b border-line text-[9.5px] tracking-[0.18em] text-muted">
                  <th className="pb-3 pr-4">ORDER NUMBER</th>
                  <th className="pb-3 px-4">COLLECTOR</th>
                  <th className="pb-3 px-4">ITEMS</th>
                  <th className="pb-3 px-4">STATUS</th>
                  <th className="pb-3 px-4 text-right">VALUATION</th>
                  <th className="pb-3 pl-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentDispatches.map((ord) => (
                  <tr key={ord.id}>
                    <td className="py-3.5 pr-4 font-semibold text-ink">
                      <Link
                        href={`/order/${ord.id}`}
                        className="underline-offset-4 hover:text-accent hover:underline"
                      >
                        {ord.order_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-[13.5px] text-ink">
                      {ord.customer_name}
                      <span className="ml-2 font-mono text-[10px] text-muted">
                        ({ord.shipping_address?.city || "New York"})
                      </span>
                    </td>
                    <td className="tabular py-3.5 px-4 text-muted">
                      {ord.items.reduce((s, i) => s + i.quantity, 0)} OBJECTS
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider",
                          ord.status === "delivered"
                            ? "border-sage/45 bg-sage/10 text-sage"
                            : "border-accent/45 bg-accent/10 text-accent",
                        )}
                      >
                        ● {ord.status}
                      </span>
                    </td>
                    <td className="tabular py-3.5 px-4 text-right font-medium text-ink">
                      {formatPrice(ord.total_usd, currency)}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => onJumpToTab("orders")}
                        className="rounded-full border border-line-strong bg-canvas px-3 py-1 text-[10px] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                      >
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
