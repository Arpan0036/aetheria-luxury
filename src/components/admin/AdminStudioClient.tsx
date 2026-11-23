"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LayoutGroup, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  Database,
  Lock,
  Package,
  ShieldCheck,
  Tag,
  Zap,
} from "lucide-react";
import {
  fetchCollectorDossierAction,
  toggleCollectorRoleAction,
} from "@/app/actions/account";
import { CurrencySelector, ThemeSwitcher } from "@/components/storefront/Controls";
import { AdminOverviewTab } from "./AdminOverviewTab";
import { AdminProductsTab } from "./AdminProductsTab";
import { AdminOrdersTab } from "./AdminOrdersTab";
import { AdminDiscountsTab } from "./AdminDiscountsTab";
import {
  DEMO_COLLECTOR_EMAIL,
  DEMO_COLLECTOR_ID,
  useAuthStore,
} from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import type {
  AdminStudioSnapshot,
  CatalogProduct,
  DiscountCode,
  OrderRecord,
} from "@/types/database";

type AdminTab = "overview" | "products" | "orders" | "discounts";

const NAV_TABS: {
  id: AdminTab;
  code: string;
  title: string;
  icon: typeof BarChart3;
}[] = [
  {
    id: "overview",
    code: "01 // EXECUTIVE TELEMETRY",
    title: "Revenue & Analytics",
    icon: BarChart3,
  },
  {
    id: "products",
    code: "02 // OBJECT ARCHIVE & STOCK",
    title: "Inventory & Storage",
    icon: Boxes,
  },
  {
    id: "orders",
    code: "03 // DISPATCH & ORDERS",
    title: "Order Pipeline Board",
    icon: Package,
  },
  {
    id: "discounts",
    code: "04 // PRIVILEGE CODES",
    title: "Discounts & VIP Tiers",
    icon: Tag,
  },
];

export function AdminStudioClient({
  initialSnapshot,
}: {
  initialSnapshot: AdminStudioSnapshot;
}) {
  const authProfile = useAuthStore((s) => s.profile);
  const setAuthProfile = useAuthStore((s) => s.setProfile);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [products, setProducts] = useState<CatalogProduct[]>(initialSnapshot.products);
  const [orders, setOrders] = useState<OrderRecord[]>(initialSnapshot.orders);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(
    initialSnapshot.discountCodes,
  );
  const [isActivating, startActivateTransition] = useTransition();

  const isAdmin = authProfile?.role === "admin";

  // 1-Click Activate Merchant Admin Studio
  const handleActivateMerchantAdmin = () => {
    startActivateTransition(async () => {
      const targetId = authProfile?.id ?? DEMO_COLLECTOR_ID;
      const roleRes = await toggleCollectorRoleAction(targetId, "admin");
      if (roleRes.ok && roleRes.profile) {
        setAuthProfile(roleRes.profile);
        return;
      }

      const dossier = await fetchCollectorDossierAction({
        userId: DEMO_COLLECTOR_ID,
        email: DEMO_COLLECTOR_EMAIL,
      });
      setAuthProfile({ ...dossier.profile, role: "admin" });
    });
  };

  /* ------------------------------------------------------------------------ */
  /*  ACCESS GUARD: Private Merchant Studio Access Required                    */
  /* ------------------------------------------------------------------------ */
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[920px] px-5 py-20 md:px-8 md:py-28">
        <div className="rounded-[28px] border border-line-strong bg-surface p-8 text-center shadow-[0_36px_80px_-42px_rgb(var(--shadow-tint)/0.55)] md:p-12">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-line-strong bg-canvas text-accent">
            <Lock className="size-6" strokeWidth={1.6} />
          </div>
          <p className="mt-5 font-mono text-[10.5px] tracking-[0.22em] text-accent">
            RESTRICTED STUDIO OPERATIONS // ROLE: MERCHANT ADMIN REQUIRED
          </p>
          <h1 className="mt-2 font-display text-[42px] leading-[1.02] text-ink sm:text-[54px]">
            Private Merchant Studio <em className="text-accent">Access Required.</em>
          </h1>
          <p className="mx-auto mt-3 max-w-[34rem] text-[15px] leading-relaxed text-muted">
            The No-Code Merchant Studio manages live <code className="font-mono text-ink">products</code>,{" "}
            <code className="font-mono text-ink">orders</code>,{" "}
            <code className="font-mono text-ink">discount_codes</code>, and the{" "}
            <code className="font-mono text-ink">product-images</code> Supabase Storage bucket.
            Activate Merchant Admin role below in one click.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isActivating}
              onClick={handleActivateMerchantAdmin}
              data-testid="activate-merchant-admin-btn"
              className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-accent px-7 font-mono text-[11px] font-semibold tracking-[0.16em] text-accent-on shadow-[0_16px_34px_-12px_var(--accent-primary)] transition-all hover:bg-accent-hover disabled:opacity-50"
            >
              <Zap className="size-4" strokeWidth={2} />
              {isActivating
                ? "ACTIVATING MERCHANT ADMIN ROLE IN SUPABASE…"
                : "⚡ 1-Click Activate Merchant Admin Studio"}
            </button>

            <Link
              href="/account"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-line-strong bg-canvas px-6 font-mono text-[11px] font-medium tracking-[0.14em] text-ink transition-colors hover:border-ink"
            >
              Open Collector Portal (/account) →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  AUTHENTICATED MERCHANT STUDIO ARCHITECTURAL SHELL                        */
  /* ------------------------------------------------------------------------ */
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-4 sm:px-6 md:px-8 md:pb-28 md:pt-8">
      {/* Tablet & Mobile (< 1024px) Sticky Top Horizontal Tab Bar */}
      <div className="sticky top-[68px] z-30 -mx-4 mb-6 border-y border-line bg-canvas/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
        <div className="mb-2.5 flex items-center justify-between font-mono text-[9.5px] tracking-[0.18em]">
          <span className="text-ink">AETHERIA® // STUDIO OPS</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              initialSnapshot.mode === "supabase-live" ? "text-sage" : "text-accent",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                initialSnapshot.mode === "supabase-live" ? "bg-sage" : "bg-accent",
              )}
            />
            {initialSnapshot.mode === "supabase-live"
              ? "LIVE: SUPABASE POSTGRESQL"
              : "SANDBOX PREVIEW MODE"}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Merchant Studio mobile navigation"
          className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 font-mono text-[10px] font-medium tracking-wider transition-colors",
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong bg-surface text-ink",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                <span>{tab.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Split Layout: Left Warm Travertine Architectural Rail (w-64 / lg:w-72) + Right Content */}
      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[276px_1fr]">
        {/* Desktop Left Architectural Rail (>= 1024px) */}
        <aside
          aria-label="Merchant Studio operations sidebar"
          className="hidden lg:sticky lg:top-24 lg:block"
        >
          <div className="flex flex-col justify-between rounded-[26px] border border-line-strong bg-surface p-5 shadow-[0_28px_60px_-38px_rgb(var(--shadow-tint)/0.5)]">
            <div>
              {/* Brand & Live Supabase Connection Indicator */}
              <div className="border-b border-line pb-4">
                <p className="font-mono text-[10px] tracking-[0.22em] text-muted">
                  AETHERIA® // STUDIO OPS
                </p>
                <h2 className="mt-1 font-display text-[30px] leading-none text-ink">
                  Merchant <em className="text-accent">Studio</em>
                </h2>
                <div
                  className={cn(
                    "mt-3 inline-flex items-center gap-2 rounded-full border bg-canvas px-3 py-1 font-mono text-[9.5px] font-medium tracking-[0.15em]",
                    initialSnapshot.mode === "supabase-live"
                      ? "border-sage/45 text-sage"
                      : "border-accent/45 text-accent",
                  )}
                >
                  <Database className="size-3" strokeWidth={1.75} />
                  {initialSnapshot.mode === "supabase-live"
                    ? "● LIVE: SUPABASE POSTGRESQL"
                    : "● SANDBOX PREVIEW MODE (ADD SUPABASE KEYS)"}
                </div>
              </div>

              {/* 4 Primary Tabs */}
              <LayoutGroup id="admin-desktop-rail">
                <nav aria-label="Merchant Studio sections" className="my-5 space-y-1.5">
                  {NAV_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        data-testid={`admin-tab-${tab.id}`}
                        className={cn(
                          "relative flex w-full items-start gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors",
                          active ? "text-canvas" : "text-ink hover:bg-canvas/70",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="admin-active-rail-pill"
                            transition={{ type: "spring", stiffness: 360, damping: 30 }}
                            className="absolute inset-0 rounded-2xl bg-ink"
                          />
                        )}
                        <Icon
                          className={cn(
                            "relative z-10 mt-0.5 size-4 shrink-0",
                            active ? "text-accent" : "text-muted",
                          )}
                          strokeWidth={1.75}
                        />
                        <span className="relative z-10 min-w-0">
                          <span
                            className={cn(
                              "block font-mono text-[9.5px] tracking-[0.16em]",
                              active ? "text-canvas/75" : "text-muted",
                            )}
                          >
                            {tab.code}
                          </span>
                          <span className="mt-0.5 block truncate text-[13.5px] font-medium">
                            {tab.title}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </LayoutGroup>
            </div>

            {/* Bottom Utility Controls: Theme, Currency & View Live Storefront */}
            <div className="space-y-4 border-t border-line pt-4">
              <div>
                <p className="mb-1.5 font-mono text-[9px] tracking-[0.18em] text-muted">
                  STUDIO CURRENCY
                </p>
                <CurrencySelector className="w-full justify-between rounded-xl border border-line bg-canvas p-1" />
              </div>

              <div>
                <p className="mb-1.5 font-mono text-[9px] tracking-[0.18em] text-muted">
                  ATMOSPHERE
                </p>
                <ThemeSwitcher className="w-full justify-between rounded-xl border border-line bg-canvas p-1" />
              </div>

              <Link
                href="/shop"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line-strong bg-canvas font-mono text-[10px] font-medium tracking-[0.15em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.75} />
                ← View Live Storefront
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Main Stage */}
        <div className="min-w-0">
          {/* Top Studio Header */}
          <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-accent">
                NO-CODE MERCHANT STUDIO //{" "}
                {NAV_TABS.find((t) => t.id === activeTab)?.code}
              </p>
              <h1 className="mt-1 font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.02] text-ink">
                {activeTab === "overview" && (
                  <>
                    Executive <em className="text-accent">Telemetry.</em>
                  </>
                )}
                {activeTab === "products" && (
                  <>
                    Object Archive &amp; <em className="text-accent">Inventory.</em>
                  </>
                )}
                {activeTab === "orders" && (
                  <>
                    Live Dispatch &amp; <em className="text-accent">Orders.</em>
                  </>
                )}
                {activeTab === "discounts" && (
                  <>
                    Collector Privilege <em className="text-accent">Codes.</em>
                  </>
                )}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] tracking-[0.15em]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/45 bg-surface px-3.5 py-1.5 text-sage">
                <ShieldCheck className="size-3.5" strokeWidth={1.75} />
                OPERATOR: {authProfile?.full_name.toUpperCase() ?? "JULIAN VANCE"} (ADMIN)
              </span>
              <Link
                href="/account"
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-ink transition-colors hover:border-ink"
              >
                COLLECTOR PASS →
              </Link>
            </div>
          </header>

          {/* Active Tab View */}
          {activeTab === "overview" && (
            <AdminOverviewTab
              categories={initialSnapshot.categories}
              products={products}
              orders={orders}
              onJumpToTab={setActiveTab}
            />
          )}

          {activeTab === "products" && (
            <AdminProductsTab
              categories={initialSnapshot.categories}
              products={products}
              onProductsChange={setProducts}
            />
          )}

          {activeTab === "orders" && (
            <AdminOrdersTab orders={orders} onOrdersChange={setOrders} />
          )}

          {activeTab === "discounts" && (
            <AdminDiscountsTab
              discountCodes={discountCodes}
              onDiscountCodesChange={setDiscountCodes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
