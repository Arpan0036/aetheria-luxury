"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Check,
  FileText,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  fetchCollectorDossierAction,
  toggleCollectorRoleAction,
  updateCollectorProfileAction,
} from "@/app/actions/account";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { CollectorPass3D } from "./CollectorPass3D";
import {
  DEMO_COLLECTOR_EMAIL,
  DEMO_COLLECTOR_ID,
  useAuthStore,
} from "@/store/useAuthStore";
import { buildCartItemFromProduct, useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type {
  CatalogProduct,
  CollectorProfile,
  OrderRecord,
  OrderShippingAddress,
} from "@/types/database";

type AuthTab = "signin" | "signup";
type PortalTab = "orders" | "warranty" | "dossier";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Switzerland",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
] as const;

function formatDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "NOV 18, 2026";
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return "NOV 18, 2026";
  }
}

export function AccountPortalClient({
  initialProfile,
  initialOrders,
  catalogProducts,
}: {
  initialProfile: CollectorProfile;
  initialOrders: OrderRecord[];
  catalogProducts: CatalogProduct[];
}) {
  const router = useRouter();
  const currency = useUIStore((s) => s.activeCurrency);
  const authProfile = useAuthStore((s) => s.profile);
  const setAuthProfile = useAuthStore((s) => s.setProfile);
  const signOutStore = useAuthStore((s) => s.signOut);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  // Auth Gateway Form State
  const [authMode, setAuthMode] = useState<AuthTab>("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthPending, startAuthTransition] = useTransition();

  // Authenticated Portal State
  const [activeTab, setActiveTab] = useState<PortalTab>("orders");
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [roleToast, setRoleToast] = useState<string | null>(null);
  const [isRolePending, startRoleTransition] = useTransition();
  const [verifiedSerial, setVerifiedSerial] = useState<string | null>(null);

  // Tab 03: Dispatch Dossier Editor State
  const [dossierName, setDossierName] = useState(
    authProfile?.full_name ?? initialProfile.full_name,
  );
  const [dossierPhone, setDossierPhone] = useState(
    authProfile?.default_shipping_address?.phone ??
      initialProfile.default_shipping_address?.phone ??
      "+1 (212) 555-0194",
  );
  const [dossierStreet, setDossierStreet] = useState(
    authProfile?.default_shipping_address?.street ??
      initialProfile.default_shipping_address?.street ??
      "412 Mercer St",
  );
  const [dossierApartment, setDossierApartment] = useState(
    authProfile?.default_shipping_address?.apartment ??
      initialProfile.default_shipping_address?.apartment ??
      "Penthouse B",
  );
  const [dossierCity, setDossierCity] = useState(
    authProfile?.default_shipping_address?.city ??
      initialProfile.default_shipping_address?.city ??
      "New York",
  );
  const [dossierState, setDossierState] = useState(
    authProfile?.default_shipping_address?.state ??
      initialProfile.default_shipping_address?.state ??
      "NY",
  );
  const [dossierPostal, setDossierPostal] = useState(
    authProfile?.default_shipping_address?.postal_code ??
      initialProfile.default_shipping_address?.postal_code ??
      "10013",
  );
  const [dossierCountry, setDossierCountry] = useState(
    authProfile?.default_shipping_address?.country ??
      initialProfile.default_shipping_address?.country ??
      "United States",
  );
  const [dossierToast, setDossierToast] = useState<string | null>(null);
  const [isDossierPending, startDossierTransition] = useTransition();

  // Sync dossier fields whenever authProfile changes
  const syncEditorFromProfile = (prof: CollectorProfile) => {
    const addr = prof.default_shipping_address ?? {};
    setDossierName(prof.full_name || "Julian Vance");
    setDossierPhone(addr.phone || "+1 (212) 555-0194");
    setDossierStreet(addr.street || "412 Mercer St");
    setDossierApartment(addr.apartment || "Penthouse B");
    setDossierCity(addr.city || "New York");
    setDossierState(addr.state || "NY");
    setDossierPostal(addr.postal_code || "10013");
    setDossierCountry(addr.country || "United States");
  };

  // Refresh live profile & orders when already authenticated
  useEffect(() => {
    if (!authProfile) return;
    let active = true;
    fetchCollectorDossierAction({
      userId: authProfile.id,
      email: authProfile.email,
    }).then((res) => {
      if (!active) return;
      setAuthProfile(res.profile);
      setOrders(res.orders);
      syncEditorFromProfile(res.profile);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authProfile?.id]);

  const productById = useMemo(
    () => new Map(catalogProducts.map((p) => [p.id, p])),
    [catalogProducts],
  );

  // Total archive valuation across collector's orders
  const totalValuationUsd = useMemo(
    () =>
      Math.round(
        orders.reduce((sum, ord) => sum + Number(ord.total_usd || 0), 0) * 100,
      ) / 100,
    [orders],
  );

  // Warranty certificates derived from purchased order items (or flagship preview if 0 items)
  const warrantyCertificates = useMemo(() => {
    const list: {
      serialNumber: string;
      orderNumber: string;
      purchaseDate: string;
      expiryYear: number;
      productTitle: string;
      variantName: string;
      image: string;
      sku: string;
      slug: string;
    }[] = [];

    for (const ord of orders) {
      for (const [idx, item] of ord.items.entries()) {
        const matchedProd = productById.get(item.product_id);
        const serialSuffix = `${ord.order_number.slice(-4)}-${String(idx + 1).padStart(2, "0")}`;
        list.push({
          serialNumber: `SN-AETH-6061-${serialSuffix}`,
          orderNumber: ord.order_number,
          purchaseDate: formatDateLabel(ord.created_at),
          expiryYear: 2036,
          productTitle: item.product_title,
          variantName: item.variant_name || "Archive Standard Finish",
          image:
            matchedProd?.images?.[0] ?? "/images/products/aether-01-headphones.png",
          sku: matchedProd?.sku ?? "AE-SA-001",
          slug: matchedProd?.slug ?? "aether-01-spatial-reference-headphones",
        });
      }
    }

    if (list.length === 0 && catalogProducts[0]) {
      const f = catalogProducts[0];
      list.push({
        serialNumber: "SN-AETH-6061-0001-01",
        orderNumber: "AETH-2026-ARCHIVE",
        purchaseDate: "NOV 18, 2026",
        expiryYear: 2036,
        productTitle: f.title,
        variantName: f.variants[0]?.variant_name ?? "Obsidian Matte",
        image: f.images?.[0] ?? "/images/products/aether-01-headphones.png",
        sku: f.sku,
        slug: f.slug,
      });
    }

    return list;
  }, [orders, productById, catalogProducts]);

  // 1-Click VIP Collector Demo Sign-In
  const handleVipDemoLogin = () => {
    setAuthError(null);
    startAuthTransition(async () => {
      const res = await fetchCollectorDossierAction({
        userId: DEMO_COLLECTOR_ID,
        email: DEMO_COLLECTOR_EMAIL,
      });
      setAuthProfile(res.profile);
      setOrders(res.orders);
      syncEditorFromProfile(res.profile);
    });
  };

  // Standard Email/Password Sign In or Create Dossier
  const handleAuthSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    const cleanEmail = authEmail.trim().toLowerCase();
    const cleanPassword = authPassword.trim();
    const cleanName = authName.trim() || "Julian Vance";

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthError("Please enter a valid collector email address.");
      return;
    }
    if (cleanPassword.length < 6) {
      setAuthError("Security passphrase must be at least 6 characters.");
      return;
    }

    startAuthTransition(async () => {
      const supabase = createBrowserSupabaseClient();
      let resolvedUserId = DEMO_COLLECTOR_ID;

      if (supabase) {
        try {
          if (authMode === "signup") {
            const { data } = await supabase.auth.signUp({
              email: cleanEmail,
              password: cleanPassword,
              options: { data: { full_name: cleanName } },
            });
            if (data?.user?.id) resolvedUserId = data.user.id;
          } else {
            const { data } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPassword,
            });
            if (data?.user?.id) resolvedUserId = data.user.id;
          }
        } catch {
          /* fallback to live profile dossier lookup */
        }
      }

      const res = await fetchCollectorDossierAction({
        userId: resolvedUserId,
        email: cleanEmail,
        fullName: authMode === "signup" ? cleanName : undefined,
      });
      setAuthProfile(res.profile);
      setOrders(res.orders);
      syncEditorFromProfile(res.profile);
    });
  };

  // 1-Click Role Switcher (Collector <-> Merchant Admin)
  const handleToggleRole = () => {
    if (!authProfile) return;
    const nextRole = authProfile.role === "admin" ? "customer" : "admin";
    setRoleToast(null);

    startRoleTransition(async () => {
      const res = await toggleCollectorRoleAction(authProfile.id, nextRole);
      if (res.ok && res.profile) {
        setAuthProfile(res.profile);
        setRoleToast(
          `LIVE SUPABASE PUBLIC.PROFILES.ROLE UPDATED → '${res.profile.role.toUpperCase()}'`,
        );
      } else if (res.error) {
        setRoleToast(`ROLE UPDATE ERROR: ${res.error}`);
      }
    });
  };

  // 1-Click Reorder to Bag
  const handleReorderToBag = (ord: OrderRecord) => {
    for (const item of ord.items) {
      const matched = productById.get(item.product_id) ?? catalogProducts[0];
      if (!matched) continue;
      const variant =
        matched.variants.find(
          (v) => v.id === item.variant_id || v.variant_name === item.variant_name,
        ) ?? matched.variants[0];
      addItem(buildCartItemFromProduct(matched, variant, item.quantity), false);
    }
    setCartOpen(true);
  };

  // Tab 03: Save Sanctuary Dispatch Dossier to live Supabase public.profiles
  const handleSaveDossier = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authProfile) return;
    setDossierToast(null);

    const nextAddress: OrderShippingAddress = {
      street: dossierStreet.trim() || "412 Mercer St",
      apartment: dossierApartment.trim() || "Penthouse B",
      city: dossierCity.trim() || "New York",
      state: dossierState.trim() || "NY",
      postal_code: dossierPostal.trim() || "10013",
      country: dossierCountry.trim() || "United States",
      phone: dossierPhone.trim() || "+1 (212) 555-0194",
    };

    startDossierTransition(async () => {
      const res = await updateCollectorProfileAction({
        profileId: authProfile.id,
        fullName: dossierName,
        defaultShippingAddress: nextAddress,
      });

      if (res.ok && res.profile) {
        setAuthProfile(res.profile);
        setDossierToast("✓ DISPATCH DOSSIER SYNCED TO LIVE SUPABASE");
      } else {
        setDossierToast(res.error ?? "FAILED TO SYNC DOSSIER");
      }
    });
  };

  const handleSignOut = () => {
    const supabase = createBrowserSupabaseClient();
    supabase?.auth.signOut().catch(() => {});
    signOutStore();
  };

  /* ------------------------------------------------------------------------ */
  /*  1. UNAUTHENTICATED VIEW — LUXURY AUTHENTICATION GATEWAY                  */
  /* ------------------------------------------------------------------------ */
  if (!authProfile) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-6 md:px-8 md:pb-32 md:pt-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 font-mono text-[10.5px] tracking-[0.18em] text-muted">
          <span>PRIVATE CLIENT ARCHIVE {"//"} SUPABASE AUTHENTICATION</span>
          <span className="text-sage">● 256-BIT COLLECTOR VAULT</span>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* 1.1 Left Column: Editorial Sanctuary & 3D Membership Preview */}
          <div className="space-y-6 lg:col-span-6">
            <div>
              <p className="font-mono text-[10.5px] tracking-[0.2em] text-accent">
                SERIES 01 // FOUNDING COLLECTOR SANCTUARY
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.65rem,5vw,4.5rem)] leading-[1.02] text-ink">
                Enter the Collector <em className="text-accent">Sanctuary.</em>
              </h1>
              <p className="mt-3 max-w-[36rem] text-[15px] leading-relaxed text-muted">
                Access your serialized 10-year hardware warranty vault, inspect live DHL Express
                shipment telemetry, manage your default DDP sanctuary coordinates, or switch into
                Merchant Admin mode.
              </p>
            </div>

            <CollectorPass3D
              fullName="Julian Vance"
              email={DEMO_COLLECTOR_EMAIL}
              memberId="AETH-MEM-2026-8841"
              role="customer"
              totalValuationUsd={
                initialOrders.reduce((s, o) => s + o.total_usd, 0) || 1200
              }
              orderCount={Math.max(1, initialOrders.length)}
              isPreview
            />
          </div>

          {/* 1.2 Right Column: Dual-Mode Sign In / Create Dossier + 1-Click VIP Sandbox */}
          <div className="lg:col-span-6">
            <div className="rounded-[28px] border border-line-strong bg-surface p-6 shadow-[0_32px_70px_-38px_rgb(var(--shadow-tint)/0.5)] md:p-8">
              {/* 1-Click VIP Collector Demo Access */}
              <div className="mb-6 rounded-2xl border border-accent/45 bg-canvas p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9.5px] tracking-[0.16em] text-muted">
                  <span className="text-accent">INSTANT TIER-1 SANDBOX SESSION</span>
                  <span>NO EMAIL CONFIRMATION REQUIRED</span>
                </div>
                <p className="mt-1.5 text-[13px] text-muted">
                  Authenticate immediately as <strong className="text-ink">Julian Vance</strong> (
                  <code className="font-mono text-[11.5px] text-ink">{DEMO_COLLECTOR_EMAIL}</code>)
                  connected to live Supabase <code className="font-mono text-ink">profiles</code>{" "}
                  and <code className="font-mono text-ink">orders</code>.
                </p>
                <button
                  type="button"
                  disabled={isAuthPending}
                  onClick={handleVipDemoLogin}
                  data-testid="vip-demo-login-btn"
                  className="mt-3.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-[11px] font-semibold tracking-[0.15em] text-accent-on shadow-[0_14px_30px_-12px_var(--accent-primary)] transition-all hover:bg-accent-hover disabled:opacity-50"
                >
                  <Zap className="size-4" strokeWidth={2} />
                  {isAuthPending
                    ? "AUTHENTICATING LIVE SUPABASE DOSSIER…"
                    : "⚡ 1-Click VIP Collector Demo Access"}
                </button>
              </div>

              {/* Dual-Mode Toggle Tabs */}
              <div
                role="tablist"
                aria-label="Authentication mode"
                className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-canvas p-1.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "signin"}
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthError(null);
                  }}
                  className={cn(
                    "h-10 rounded-xl font-mono text-[10px] font-medium tracking-[0.14em] transition-colors",
                    authMode === "signin"
                      ? "bg-ink text-canvas"
                      : "text-muted hover:text-ink",
                  )}
                >
                  [ 01 // SIGN IN TO ARCHIVE ]
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "signup"}
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError(null);
                  }}
                  className={cn(
                    "h-10 rounded-xl font-mono text-[10px] font-medium tracking-[0.14em] transition-colors",
                    authMode === "signup"
                      ? "bg-ink text-canvas"
                      : "text-muted hover:text-ink",
                  )}
                >
                  [ 02 // CREATE COLLECTOR DOSSIER ]
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "signup" && (
                  <div>
                    <label
                      htmlFor="auth-fullname"
                      className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                    >
                      COLLECTOR FULL NAME *
                    </label>
                    <input
                      id="auth-fullname"
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Julian Vance"
                      className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    COLLECTOR EMAIL ADDRESS *
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="julian.vance@aetheria.studio"
                    className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    SECURITY PASSPHRASE *
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                  />
                </div>

                {authError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-accent/45 bg-accent/10 px-3.5 py-2.5 font-mono text-[10.5px] tracking-wider text-accent"
                  >
                    {authError}
                  </p>
                )}

                <MagneticButton
                  type="submit"
                  size="lg"
                  variant="primary"
                  disabled={isAuthPending}
                  className="mt-2 w-full"
                >
                  <KeyRound className="size-4" strokeWidth={1.75} />
                  {authMode === "signin"
                    ? "Authorize Archive Sign-In →"
                    : "Initialize Collector Dossier →"}
                </MagneticButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  2. AUTHENTICATED COLLECTOR PORTAL & 3D MEMBERSHIP PASS                   */
  /* ------------------------------------------------------------------------ */
  const memberId = `AETH-MEM-2026-${authProfile.id.slice(-4).toUpperCase()}`;

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-6 md:px-8 md:pb-32 md:pt-10">
      {/* Top Telemetry Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 font-mono text-[10.5px] tracking-[0.18em] text-muted">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sage">
            <UserCheck className="size-3.5" strokeWidth={1.75} />
            AUTHENTICATED COLLECTOR SANCTUARY
          </span>
          <span aria-hidden>{"//"}</span>
          <span className="text-ink">{memberId}</span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[10px] tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
        >
          <LogOut className="size-3" strokeWidth={1.75} />
          Sign Out of Sanctuary
        </button>
      </div>

      {/* 2.1 Top Header & Interactive 3D Titanium Collector Pass */}
      <div className="mb-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-mono text-[10.5px] tracking-[0.2em] text-accent">
            PRIVATE CLIENT VAULT // LIVE SUPABASE PROFILES
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.5rem,4.6vw,4.25rem)] leading-[1.02] text-ink">
            Welcome back, <em className="text-accent">{authProfile.full_name}.</em>
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            Your 3D Titanium Collector Pass grants direct access to serialized order telemetry,
            10-year hardware warranty certificates, and 1-click role switching between{" "}
            <strong className="text-ink">Collector</strong> and{" "}
            <strong className="text-ink">Merchant Admin</strong>.
          </p>

          {roleToast && (
            <div
              role="status"
              data-testid="role-switch-toast"
              className="mt-4 rounded-xl border border-sage/45 bg-sage/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] text-sage"
            >
              ✓ {roleToast}
            </div>
          )}

          {authProfile.role === "admin" && (
            <div className="mt-4">
              <Link
                href="/admin"
                data-testid="open-admin-studio-btn"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 font-mono text-[10.5px] font-semibold tracking-[0.15em] text-accent-on shadow-sm transition-colors hover:bg-accent-hover"
              >
                Open No-Code Merchant Studio (/admin) <ArrowRight className="size-3.5" strokeWidth={2} />
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <CollectorPass3D
            fullName={authProfile.full_name}
            email={authProfile.email}
            memberId={memberId}
            role={authProfile.role}
            totalValuationUsd={totalValuationUsd}
            orderCount={orders.length}
            isUpdatingRole={isRolePending}
            onToggleRole={handleToggleRole}
          />
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <LayoutGroup id="collector-portal-tabs">
        <div
          role="tablist"
          aria-label="Collector Portal Sections"
          className="mb-8 grid grid-cols-1 gap-2 rounded-2xl border border-line bg-surface p-1.5 sm:grid-cols-3"
        >
          {[
            {
              id: "orders" as const,
              label: `01 // SERIALIZED ORDER ARCHIVE (${orders.length})`,
              icon: Package,
            },
            {
              id: "warranty" as const,
              label: `02 // HARDWARE WARRANTY VAULT (${warrantyCertificates.length})`,
              icon: Award,
            },
            {
              id: "dossier" as const,
              label: "03 // SANCTUARY DISPATCH DOSSIER",
              icon: MapPin,
            },
          ].map((tab) => {
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
                  "relative inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 font-mono text-[10.5px] font-medium tracking-[0.14em] transition-colors",
                  active ? "text-canvas" : "text-muted hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-portal-tab-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-ink"
                  />
                )}
                <Icon className="relative z-10 size-3.5" strokeWidth={1.75} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* 2.2 Tab 01 // Serialized Order Archive & Live Telemetry */}
      {activeTab === "orders" && (
        <section aria-label="Serialized Order Archive" className="space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-[26px] border border-line bg-surface p-10 text-center">
              <p className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
                00 SERIALIZED ORDERS IN ARCHIVE
              </p>
              <h2 className="mt-2 font-display text-[36px] text-ink">
                No Dispatches Recorded Yet
              </h2>
              <p className="mx-auto mt-2 max-w-[30rem] text-[14px] text-muted">
                Acquire your first instrument from the Object Archive to generate live DHL Express
                telemetry and a 10-year hardware warranty certificate.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-mono text-[11px] font-medium tracking-wider text-canvas hover:bg-accent"
              >
                Explore Object Archive <ArrowRight className="size-3.5" strokeWidth={1.75} />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((ord) => (
                <li
                  key={ord.id}
                  className="rounded-[26px] border border-line-strong bg-surface p-6 shadow-[0_24px_50px_-38px_rgb(var(--shadow-tint)/0.45)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-ink px-3.5 py-1 font-mono text-[11px] font-semibold tracking-[0.16em] text-canvas">
                        {ord.order_number}
                      </span>
                      <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted">
                        {formatDateLabel(ord.created_at)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.16em] uppercase",
                          ord.status === "delivered"
                            ? "border-sage/45 bg-sage/10 text-sage"
                            : "border-accent/45 bg-accent/10 text-accent",
                        )}
                      >
                        ● {ord.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
                        TOTAL PAID:{" "}
                      </span>
                      <strong className="tabular font-mono text-[18px] font-semibold text-ink">
                        {formatPrice(ord.total_usd, currency)}
                      </strong>
                    </div>
                  </div>

                  {/* Purchased Items Strip */}
                  <ul className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ord.items.map((item) => {
                      const matched = productById.get(item.product_id);
                      const img =
                        matched?.images?.[0] ?? "/images/products/aether-01-headphones.png";
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 rounded-2xl border border-line bg-canvas p-3"
                        >
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-[#EFECE6]">
                            <Image
                              src={img}
                              alt={item.product_title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-[20px] leading-tight text-ink">
                              {item.product_title}
                            </p>
                            <p className="mt-0.5 truncate font-mono text-[9.5px] tracking-wider text-muted">
                              {(item.variant_name || "Standard Finish").toUpperCase()} · QTY{" "}
                              {item.quantity}
                            </p>
                            <p className="tabular mt-0.5 font-mono text-[11.5px] font-medium text-ink">
                              {formatPrice(item.unit_price_usd * item.quantity, currency)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* 3 Direct Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/order/${ord.id}`}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-mono text-[10.5px] font-medium tracking-[0.14em] text-canvas transition-colors hover:bg-accent"
                      >
                        Live Telemetry &amp; Invoice →
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleReorderToBag(ord)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-4 font-mono text-[10.5px] font-medium tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                      >
                        <RotateCcw className="size-3.5" strokeWidth={1.75} />
                        1-Click Reorder to Bag
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/order/${ord.id}#official-tax-invoice`)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-canvas px-4 font-mono text-[10px] tracking-[0.14em] text-muted transition-colors hover:border-ink hover:text-ink"
                    >
                      <FileText className="size-3.5" strokeWidth={1.75} />
                      Download Tax Receipt
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 2.3 Tab 02 // Hardware Warranty Vault & Certificates of Authenticity */}
      {activeTab === "warranty" && (
        <section aria-label="Hardware Warranty Vault" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-3.5 font-mono text-[10.5px] tracking-[0.16em]">
            <span className="inline-flex items-center gap-2 text-ink">
              <ShieldCheck className="size-4 text-sage" strokeWidth={1.75} />
              SERIALIZED 10-YEAR CNC CHASSIS &amp; TRANSDUCER GUARANTEE
            </span>
            <span className="text-muted">ZURICH / COPENHAGEN QUALITY ARCHIVE</span>
          </div>

          {verifiedSerial && (
            <div
              role="status"
              className="rounded-2xl border border-sage/45 bg-sage/10 px-5 py-3 font-mono text-[10.5px] tracking-[0.16em] text-sage"
            >
              ✓ SERIAL CERTIFICATE {verifiedSerial} VERIFIED IN LIVE AETHERIA ARCHIVE — VALID
              THROUGH 2036
            </div>
          )}

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {warrantyCertificates.map((cert) => (
              <li
                key={cert.serialNumber}
                className="relative overflow-hidden rounded-[26px] border border-line-strong bg-surface p-6 shadow-[0_28px_60px_-38px_rgb(var(--shadow-tint)/0.5)]"
              >
                <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <p className="font-mono text-[9.5px] tracking-[0.2em] text-accent">
                      CERTIFICATE OF AUTHENTICITY // 10-YEAR ARCHIVE
                    </p>
                    <p className="tabular mt-1 font-mono text-[13px] font-semibold tracking-[0.16em] text-ink">
                      {cert.serialNumber}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sage/45 bg-sage/10 px-3 py-1 font-mono text-[9px] font-semibold tracking-[0.16em] text-sage">
                    <Check className="size-3" strokeWidth={2.2} />
                    CNC SEAL PASSED
                  </span>
                </div>

                <div className="my-5 flex items-center gap-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-[#EFECE6]">
                    <Image
                      src={cert.image}
                      alt={cert.productTitle}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/product/${cert.slug}`}
                      className="font-display text-[26px] leading-tight text-ink hover:text-accent"
                    >
                      {cert.productTitle}
                    </Link>
                    <p className="mt-1 font-mono text-[10.5px] tracking-wider text-muted">
                      FINISH: {cert.variantName.toUpperCase()}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-wider text-muted">
                      ORDER REF: {cert.orderNumber}
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-canvas p-3.5 font-mono text-[10px]">
                  <div>
                    <dt className="text-[8.5px] tracking-[0.16em] text-muted">ACQUIRED</dt>
                    <dd className="mt-1 text-ink">{cert.purchaseDate}</dd>
                  </div>
                  <div>
                    <dt className="text-[8.5px] tracking-[0.16em] text-muted">WARRANTY EXP</dt>
                    <dd className="tabular mt-1 text-sage">{cert.expiryYear} (10-YR)</dd>
                  </div>
                  <div>
                    <dt className="text-[8.5px] tracking-[0.16em] text-muted">HOLDER</dt>
                    <dd className="mt-1 truncate text-ink">{authProfile.full_name}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between gap-3 pt-1">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.14em] text-muted">
                    <Sparkles className="size-3 text-accent" strokeWidth={1.75} />
                    TOLERANCE ±0.01MM CERTIFIED
                  </span>
                  <button
                    type="button"
                    onClick={() => setVerifiedSerial(cert.serialNumber)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 font-mono text-[10px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                  >
                    <Printer className="size-3" strokeWidth={1.75} />
                    Print / Verify Certificate
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 2.4 Tab 03 // Sanctuary Dispatch Dossier (Live Supabase profiles Editor) */}
      {activeTab === "dossier" && (
        <section
          aria-label="Sanctuary Dispatch Dossier Editor"
          className="rounded-[28px] border border-line-strong bg-surface p-6 shadow-[0_28px_60px_-38px_rgb(var(--shadow-tint)/0.5)] md:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
                LIVE SUPABASE PUBLIC.PROFILES // DEFAULT SHIPPING ADDRESS
              </p>
              <h2 className="mt-1 font-display text-[32px] leading-none text-ink">
                Sanctuary Dispatch Coordinates
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-wider text-muted">
              AUTO-FILLS PRIVATE CHECKOUT (/CHECKOUT)
            </span>
          </div>

          <AnimatePresence>
            {dossierToast && (
              <motion.div
                role="status"
                data-testid="dossier-sync-toast"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-sage/45 bg-sage/10 px-4 py-3 font-mono text-[11px] font-medium tracking-[0.15em] text-sage"
              >
                {dossierToast}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSaveDossier} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="dossier-fullname"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  COLLECTOR FULL NAME *
                </label>
                <input
                  id="dossier-fullname"
                  type="text"
                  required
                  value={dossierName}
                  onChange={(e) => setDossierName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dossier-phone"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  DIRECT COURIER TELEPHONE *
                </label>
                <input
                  id="dossier-phone"
                  type="tel"
                  required
                  value={dossierPhone}
                  onChange={(e) => setDossierPhone(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dossier-street"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  STREET ADDRESS *
                </label>
                <input
                  id="dossier-street"
                  type="text"
                  required
                  value={dossierStreet}
                  onChange={(e) => setDossierStreet(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dossier-apartment"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  APARTMENT / SUITE / PENTHOUSE
                </label>
                <input
                  id="dossier-apartment"
                  type="text"
                  value={dossierApartment}
                  onChange={(e) => setDossierApartment(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dossier-city"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  CITY *
                </label>
                <input
                  id="dossier-city"
                  type="text"
                  required
                  value={dossierCity}
                  onChange={(e) => setDossierCity(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dossier-state"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  STATE / PROVINCE / CANTON *
                </label>
                <input
                  id="dossier-state"
                  type="text"
                  required
                  value={dossierState}
                  onChange={(e) => setDossierState(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dossier-postal"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  POSTAL / ZIP CODE *
                </label>
                <input
                  id="dossier-postal"
                  type="text"
                  required
                  value={dossierPostal}
                  onChange={(e) => setDossierPostal(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dossier-country"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  COUNTRY / REGION (DDP) *
                </label>
                <select
                  id="dossier-country"
                  value={dossierCountry}
                  onChange={(e) => setDossierCountry(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none focus:border-ink"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <Link
                href="/checkout"
                className="font-mono text-[11px] tracking-[0.14em] text-accent underline underline-offset-4 hover:text-ink"
              >
                TEST AUTO-FILL ON /CHECKOUT →
              </Link>

              <MagneticButton
                type="submit"
                size="md"
                variant="primary"
                disabled={isDossierPending}
              >
                <Check className="size-4" strokeWidth={2} />
                {isDossierPending
                  ? "Syncing to Live Supabase…"
                  : "Save Dispatch Dossier to Supabase"}
              </MagneticButton>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
