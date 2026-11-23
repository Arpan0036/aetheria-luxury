"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  UserCheck,
  Zap,
} from "lucide-react";
import { validateDiscountAction } from "@/app/actions/discount";
import { fetchCollectorDossierAction } from "@/app/actions/account";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { PaymentCard3D } from "./PaymentCard3D";
import { useAuthStore } from "@/store/useAuthStore";
import {
  buildCartItemFromProduct,
  computeCartFinancials,
  useCartStore,
} from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct } from "@/types/database";

export const LAST_ORDER_STORAGE_KEY = "aetheria-last-order-v1";

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

const QUICK_PROMOS = ["AETHERIA15", "TIER1VIP", "FREESHIP"] as const;

function formatCardNumberInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function CheckoutClient({ flagshipProducts }: { flagshipProducts: CatalogProduct[] }) {
  const router = useRouter();
  const currency = useUIStore((s) => s.activeCurrency);
  const authProfile = useAuthStore((s) => s.profile);
  const setAuthProfile = useAuthStore((s) => s.setProfile);
  const items = useCartStore((s) => s.items);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const addItem = useCartStore((s) => s.addItem);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCartOpen = useCartStore((s) => s.setOpen);

  // Section 01: Collector Dossier & Destination
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string>("United States");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Section 02: Insured Air Dispatch Tier
  const [shippingTier, setShippingTier] = useState<"dhl-ddp" | "white-glove">("dhl-ddp");

  // Section 03: Payment Stage & Mode
  const [paymentMethod, setPaymentMethod] = useState<"sandbox-card" | "vip-express">(
    "sandbox-card",
  );
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("08/29");
  const [cvc, setCvc] = useState("888");
  const [isCvcFocused, setIsCvcFocused] = useState(false);

  // Promo & Submission state
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, startPromoTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-populate checkout coordinates when a collector is authenticated
  useEffect(() => {
    if (!authProfile) return;
    let active = true;
    fetchCollectorDossierAction({
      userId: authProfile.id,
      email: authProfile.email,
    }).then((res) => {
      if (!active || !res.profile) return;
      setAuthProfile(res.profile);
      const liveAddr = res.profile.default_shipping_address;
      setEmail(res.profile.email);
      setFullName(res.profile.full_name);
      setCardHolder(res.profile.full_name.toUpperCase());
      if (liveAddr) {
        if (liveAddr.phone) setPhone(liveAddr.phone);
        if (liveAddr.country) setCountry(liveAddr.country);
        if (liveAddr.street) setStreet(liveAddr.street);
        if (liveAddr.apartment !== undefined) setApartment(liveAddr.apartment);
        if (liveAddr.city) setCity(liveAddr.city);
        if (liveAddr.state) setStateProvince(liveAddr.state);
        if (liveAddr.postal_code) setPostalCode(liveAddr.postal_code);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authProfile?.id]);

  const baseFinancials = useMemo(
    () => computeCartFinancials(items, appliedPromo),
    [items, appliedPromo],
  );

  const dhlShippingUsd = baseFinancials.subtotalUsd >= 150 ? 0 : 25;
  const effectiveShippingUsd =
    items.length === 0 ? 0 : shippingTier === "white-glove" ? 45 : dhlShippingUsd;
  const effectiveGrandTotalUsd = Math.max(
    0,
    Math.round(
      (baseFinancials.subtotalUsd - baseFinancials.discountAmountUsd + effectiveShippingUsd) * 100,
    ) / 100,
  );

  // 1-Click Auto-Fill Tier-1 Demo Collector
  const handleAutoFillDemoCollector = () => {
    setEmail("julian.vance@aetheria.studio");
    setFullName("Julian Vance");
    setPhone("+1 (212) 555-0194");
    setCountry("United States");
    setStreet("412 Mercer St");
    setApartment("Penthouse B");
    setCity("New York");
    setStateProvince("NY");
    setPostalCode("10013");
    setCardNumber("4242 4242 4242 4242");
    setCardHolder("JULIAN VANCE");
    setExpiry("08/29");
    setCvc("888");
    setSubmitError(null);

    if (items.length === 0 && flagshipProducts[0]) {
      addItem(buildCartItemFromProduct(flagshipProducts[0]), false);
    }
  };

  const handleFillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardHolder((fullName || "JULIAN VANCE").toUpperCase());
    setExpiry("08/29");
    setCvc("888");
  };

  const handleApplyPromo = (rawCode: string) => {
    const clean = rawCode.trim().toUpperCase();
    setPromoInput(clean);
    setPromoError(null);
    if (!clean) {
      setPromoError("ENTER A COLLECTOR CODE TO VALIDATE.");
      return;
    }

    startPromoTransition(async () => {
      const res = await validateDiscountAction(clean, baseFinancials.subtotalUsd);
      if (res.valid) {
        applyPromoCode({
          code: res.code,
          description: res.description,
          discount_percent: res.discount_percent,
          min_order_usd: res.min_order_usd,
          mode: res.mode,
        });
        setPromoError(null);
      } else {
        setPromoError(res.message.toUpperCase());
      }
    });
  };

  const handleCheckoutSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError("Your collector bag is empty. Add an instrument before authorizing dispatch.");
      return;
    }

    const buyerName = fullName.trim() || "Julian Vance";
    const buyerEmail = email.trim() || "julian.vance@aetheria.studio";

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authProfile?.id ?? null,
          customerEmail: buyerEmail,
          customerName: buyerName,
          shippingAddress: {
            street: street.trim() || "412 Mercer St",
            apartment: apartment.trim() || "Penthouse B",
            city: city.trim() || "New York",
            state: stateProvince.trim() || "NY",
            postal_code: postalCode.trim() || "10013",
            country,
            phone: phone.trim() || "+1 (212) 555-0194",
            shipping_tier: shippingTier,
            promo_code: appliedPromo?.code ?? null,
            card_last4: cardNumber.replace(/\D/g, "").slice(-4) || "4242",
            payment_method: paymentMethod,
          },
          subtotalUsd: baseFinancials.subtotalUsd,
          discountUsd: baseFinancials.discountAmountUsd,
          shippingUsd: effectiveShippingUsd,
          totalUsd: effectiveGrandTotalUsd,
          currency,
          items: items.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            title: line.title,
            variantName: line.variantName,
            quantity: line.quantity,
            unitPriceUsd: line.unitPriceUsd,
          })),
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        orderId?: string;
        orderNumber?: string;
        error?: string;
      };

      if (!response.ok || !data.success || !data.orderId) {
        setSubmitError(data.error ?? "Unable to authorize dispatch. Please retry.");
        setIsSubmitting(false);
        return;
      }

      try {
        localStorage.setItem(
          LAST_ORDER_STORAGE_KEY,
          JSON.stringify({
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            createdAt: new Date().toISOString(),
          }),
        );
      } catch {
        /* ignore storage restrictions */
      }

      clearCart();
      setCartOpen(false);
      router.push(`/order/${data.orderId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Network error while authorizing dispatch.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-6 md:px-8 md:pb-32 md:pt-10">
      {/* 1.1 Top Checkout Security & Telemetry Header */}
      <header className="mb-10 border-b border-line pb-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] tracking-[0.18em] text-muted">
          <nav aria-label="Checkout breadcrumb" className="flex flex-wrap items-center gap-2">
            <Link href="/shop" className="transition-colors hover:text-ink">
              COLLECTOR BAG
            </Link>
            <span aria-hidden>{"//"}</span>
            <span className="text-ink">PRIVATE CONCIERGE CHECKOUT</span>
            <span aria-hidden>{"//"}</span>
            <span className="inline-flex items-center gap-1.5 text-sage">
              <Lock className="size-3" strokeWidth={1.75} />
              [256-BIT ENCRYPTED DISPATCH]
            </span>
          </nav>

          <button
            type="button"
            onClick={handleAutoFillDemoCollector}
            className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-4 py-1.5 font-mono text-[10.5px] font-medium tracking-[0.14em] text-accent transition-all hover:bg-accent hover:text-accent-on"
          >
            <Zap className="size-3.5" strokeWidth={2} />
            ⚡ 1-Click Auto-Fill Tier-1 Demo Collector
          </button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(2.5rem,4.6vw,4.25rem)] leading-[1.02] text-ink">
              Private Concierge <em className="text-accent">Dispatch.</em>
            </h1>
            <p className="mt-2 max-w-[38rem] text-[14.5px] leading-relaxed text-muted">
              Serialized studio instruments are allocated directly from our live Supabase PostgreSQL
              ledger and dispatched DDP (Delivered Duty Paid) via insured air courier.
            </p>
          </div>
          <span className="rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-ink">
            {authProfile ? (
              <span className="inline-flex items-center gap-1.5 text-sage">
                <UserCheck className="size-3.5" strokeWidth={1.75} />
                SYNCED WITH COLLECTOR DOSSIER ({authProfile.full_name.toUpperCase()})
              </span>
            ) : (
              "ZERO-KEY SANDBOX + LIVE SUPABASE PERSISTENCE"
            )}
          </span>
        </div>
      </header>

      <form
        onSubmit={handleCheckoutSubmit}
        className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12"
      >
        {/* 1.2 Left Column (lg:col-span-7): 3-Step Concierge Dispatch & 3D Payment Deck */}
        <div className="space-y-8 lg:col-span-7">
          {/* Section 01 // Collector Dossier & Destination */}
          <section
            aria-label="Collector Dossier and Destination"
            className="rounded-[26px] border border-line bg-surface p-6 md:p-8"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
                  SECTION 01 // COLLECTOR DOSSIER &amp; DESTINATION
                </p>
                <h2 className="mt-1 font-display text-[30px] leading-none text-ink">
                  Sanctuary Delivery Coordinates
                </h2>
              </div>
              <span className="font-mono text-[10px] tracking-wider text-muted">
                DDP INSURED COURIER
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-email"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  EMAIL ADDRESS (FOR SERIALIZED INVOICE &amp; TELEMETRY) *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="julian.vance@aetheria.studio"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-fullname"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  COLLECTOR FULL NAME *
                </label>
                <input
                  id="checkout-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!cardHolder) setCardHolder(e.target.value.toUpperCase());
                  }}
                  placeholder="Julian Vance"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  DIRECT TELEPHONE (DHL COURIER ALERTS) *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (212) 555-0194"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-country"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  DESTINATION COUNTRY / REGION (DDP) *
                </label>
                <select
                  id="checkout-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-street"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  STREET ADDRESS *
                </label>
                <input
                  id="checkout-street"
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="412 Mercer St"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-apartment"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  APARTMENT / SUITE / ATELIER
                </label>
                <input
                  id="checkout-apartment"
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Penthouse B"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-city"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  CITY *
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-state"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  STATE / PROVINCE / CANTON *
                </label>
                <input
                  id="checkout-state"
                  type="text"
                  required
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  placeholder="NY"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-postal"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  POSTAL / ZIP CODE *
                </label>
                <input
                  id="checkout-postal"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10013"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>
            </div>
          </section>

          {/* Section 02 // Insured Air Dispatch Tier */}
          <section
            aria-label="Insured Air Dispatch Tier"
            className="rounded-[26px] border border-line bg-surface p-6 md:p-8"
          >
            <div className="mb-5 border-b border-line pb-4">
              <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
                SECTION 02 // INSURED AIR DISPATCH TIER
              </p>
              <h2 className="mt-1 font-display text-[30px] leading-none text-ink">
                Courier &amp; Acoustic Crating
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3.5" role="radiogroup" aria-label="Select shipping tier">
              <button
                type="button"
                role="radio"
                aria-checked={shippingTier === "dhl-ddp"}
                onClick={() => setShippingTier("dhl-ddp")}
                className={cn(
                  "flex items-start justify-between gap-4 rounded-2xl border p-4 text-left transition-all",
                  shippingTier === "dhl-ddp"
                    ? "border-ink bg-canvas shadow-sm ring-1 ring-ink/15"
                    : "border-line bg-canvas/55 hover:border-line-strong",
                )}
              >
                <div className="flex items-start gap-3">
                  <Plane className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <p className="font-mono text-[11.5px] font-medium tracking-[0.12em] text-ink">
                      DHL Express Insured Air (DDP)
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      3–4 Business Days • Duties &amp; Taxes Included
                    </p>
                  </div>
                </div>
                <span className="tabular shrink-0 font-mono text-[12px] font-medium text-sage">
                  {dhlShippingUsd === 0
                    ? "COMPLIMENTARY ($0)"
                    : formatPrice(dhlShippingUsd, currency)}
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={shippingTier === "white-glove"}
                onClick={() => setShippingTier("white-glove")}
                className={cn(
                  "flex items-start justify-between gap-4 rounded-2xl border p-4 text-left transition-all",
                  shippingTier === "white-glove"
                    ? "border-ink bg-canvas shadow-sm ring-1 ring-ink/15"
                    : "border-line bg-canvas/55 hover:border-line-strong",
                )}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <p className="font-mono text-[11.5px] font-medium tracking-[0.12em] text-ink">
                      White-Glove Priority Courier &amp; Acoustic Crating
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      48-Hour Priority Air Dispatch in serialized aluminum flight case
                    </p>
                  </div>
                </div>
                <span className="tabular shrink-0 font-mono text-[12px] font-medium text-ink">
                  {formatPrice(45, currency)}
                </span>
              </button>
            </div>
          </section>

          {/* Section 03 // Interactive 3D Metallic Payment Card Stage & Method Selector */}
          <section
            aria-label="Interactive 3D Metallic Payment Stage"
            className="rounded-[26px] border border-line bg-surface p-6 md:p-8"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
                  SECTION 03 // 3D METALLIC PAYMENT STAGE &amp; METHOD
                </p>
                <h2 className="mt-1 font-display text-[30px] leading-none text-ink">
                  Payment Authorization
                </h2>
              </div>

              <button
                type="button"
                onClick={handleFillTestCard}
                className="rounded-full border border-line-strong bg-canvas px-3.5 py-1.5 font-mono text-[10px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
              >
                Fill Test Card (4242)
              </button>
            </div>

            {/* Payment Mode Tabs */}
            <div
              role="tablist"
              aria-label="Payment method mode"
              className="mb-6 grid grid-cols-1 gap-2 rounded-2xl border border-line bg-canvas p-1.5 sm:grid-cols-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={paymentMethod === "sandbox-card"}
                onClick={() => setPaymentMethod("sandbox-card")}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 font-mono text-[10px] font-medium tracking-[0.13em] transition-colors",
                  paymentMethod === "sandbox-card"
                    ? "bg-ink text-canvas"
                    : "text-muted hover:text-ink",
                )}
              >
                <CreditCard className="size-3.5" strokeWidth={1.75} />
                <span>[ 01 // SANDBOX CARD (LIVE SUPABASE DEMO) ]</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={paymentMethod === "vip-express"}
                onClick={() => setPaymentMethod("vip-express")}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 font-mono text-[10px] font-medium tracking-[0.13em] transition-colors",
                  paymentMethod === "vip-express"
                    ? "bg-ink text-canvas"
                    : "text-muted hover:text-ink",
                )}
              >
                <Sparkles className="size-3.5" strokeWidth={1.75} />
                <span>[ 02 // 1-CLICK VIP EXPRESS PAY ]</span>
              </button>
            </div>

            {/* Live 3D Perspective Credit Card Visualizer */}
            <div className="mb-7">
              <PaymentCard3D
                cardNumber={cardNumber}
                cardHolder={cardHolder || fullName || "JULIAN VANCE"}
                expiry={expiry}
                cvc={cvc}
                isFlipped={isCvcFocused}
              />
              <p className="mt-3 text-center font-mono text-[9.5px] tracking-[0.16em] text-muted">
                {isCvcFocused
                  ? "3D CARD FLIPPED 180° — INSPECTING BACK MAGNETIC STRIP & CVC"
                  : "FOCUS THE CVC INPUT BELOW TO FLIP THE 3D CARD 180°"}
              </p>
            </div>

            {paymentMethod === "sandbox-card" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="card-number-input"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    SANDBOX CARD NUMBER *
                  </label>
                  <input
                    id="card-number-input"
                    type="text"
                    inputMode="numeric"
                    required
                    value={cardNumber}
                    onFocus={() => setIsCvcFocused(false)}
                    onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className="tabular h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 font-mono text-[14px] tracking-widest text-ink outline-none transition-colors focus:border-ink"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="card-holder-input"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    EMBOSSED CARDHOLDER NAME *
                  </label>
                  <input
                    id="card-holder-input"
                    type="text"
                    required
                    value={cardHolder}
                    onFocus={() => setIsCvcFocused(false)}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="JULIAN VANCE"
                    className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 font-mono text-[13px] tracking-wider text-ink uppercase outline-none transition-colors focus:border-ink"
                  />
                </div>

                <div>
                  <label
                    htmlFor="card-expiry-input"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    EXPIRATION DATE (MM/YY) *
                  </label>
                  <input
                    id="card-expiry-input"
                    type="text"
                    required
                    value={expiry}
                    onFocus={() => setIsCvcFocused(false)}
                    onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                    placeholder="08/29"
                    className="tabular h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 font-mono text-[14px] tracking-wider text-ink outline-none transition-colors focus:border-ink"
                  />
                </div>

                <div>
                  <label
                    htmlFor="card-cvc-input"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    CVC / SECURITY CODE (FLIPS 3D CARD) *
                  </label>
                  <input
                    id="card-cvc-input"
                    type="text"
                    inputMode="numeric"
                    required
                    value={cvc}
                    onFocus={() => setIsCvcFocused(true)}
                    onBlur={() => setIsCvcFocused(false)}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="888"
                    className="tabular h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 font-mono text-[14px] tracking-widest text-ink outline-none transition-colors focus:border-ink"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-sage/45 bg-canvas p-5 text-center">
                <p className="font-mono text-[10.5px] tracking-[0.18em] text-sage">
                  ✓ BIOMETRIC VIP EXPRESS PASSKEY READY
                </p>
                <p className="mt-1.5 text-[13.5px] text-muted">
                  Click <strong className="text-ink">Authorize &amp; Dispatch Order</strong> on the
                  right to execute 1-click biometric sandbox settlement directly to live Supabase.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* 1.3 Right Column (lg:col-span-5): Sticky Architectural Order Summary */}
        <aside className="lg:sticky lg:top-28 lg:col-span-5">
          <div className="rounded-[26px] border border-line-strong bg-surface p-6 shadow-[0_32px_70px_-38px_rgb(var(--shadow-tint)/0.5)] md:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
                  ARCHITECTURAL ORDER DOSSIER
                </p>
                <h2 className="mt-1 font-display text-[30px] leading-none text-ink">
                  Allocation Summary ({baseFinancials.totalItemsCount})
                </h2>
              </div>
              <span className="rounded-full border border-sage/45 bg-sage/10 px-3 py-1 font-mono text-[9.5px] tracking-wider text-sage">
                LIVE SUPABASE
              </span>
            </div>

            {/* Cart Line Items List or Instant Add Helper */}
            {items.length === 0 ? (
              <div className="mb-6 rounded-2xl border border-line bg-canvas p-5 text-center">
                <p className="font-display text-[24px] text-ink">Your Bag is Currently Empty</p>
                <p className="mt-1 text-[13px] text-muted">
                  Add a flagship object below or click the 1-Click Auto-Fill button above to test
                  checkout.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {flagshipProducts.slice(0, 2).map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addItem(buildCartItemFromProduct(prod), false)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-mono text-[10px] font-medium tracking-wider text-canvas hover:bg-accent"
                    >
                      <Plus className="size-3" strokeWidth={2} /> Add {prod.title.split(" ")[0]} (
                      {formatPrice(prod.price_usd, currency)})
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="mb-6 max-h-[320px] space-y-3 overflow-y-auto pr-1" aria-label="Order summary items">
                {items.map((line) => (
                  <li
                    key={line.lineKey}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-[#EFECE6]">
                        <Image
                          src={line.image}
                          alt={line.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                        <span className="tabular absolute right-1 top-1 rounded-full bg-[#141413]/85 px-1.5 py-0.5 font-mono text-[9px] text-[#F7F4EF]">
                          ×{line.quantity}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[9.5px] tracking-wider text-muted">
                          {line.sku}
                        </p>
                        <p className="truncate font-display text-[20px] leading-tight text-ink">
                          {line.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[9.5px] tracking-wider text-muted">
                          <span
                            aria-hidden
                            className="size-2 rounded-full border border-white/40"
                            style={{ backgroundColor: line.colorHex }}
                          />
                          <span>{line.variantName}</span>
                        </p>
                      </div>
                    </div>

                    <span className="tabular shrink-0 font-mono text-[14px] font-medium text-ink">
                      {formatPrice(line.unitPriceUsd * line.quantity, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Live Supabase Promo Code Bar */}
            <div className="mb-6 rounded-2xl border border-line bg-canvas p-4">
              <div className="mb-2 flex items-center justify-between font-mono text-[9.5px] tracking-[0.16em] text-muted">
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <Tag className="size-3 text-accent" strokeWidth={1.75} />
                  PRIVILEGE / PROMO CODE
                </span>
                <span>PUBLIC.DISCOUNT_CODES</span>
              </div>

              <div className="flex gap-2">
                <label htmlFor="checkout-promo-input" className="sr-only">
                  Promo code
                </label>
                <input
                  id="checkout-promo-input"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="AETHERIA15, TIER1VIP, FREESHIP"
                  className="h-10 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-3 font-mono text-[11px] tracking-wider text-ink uppercase outline-none focus:border-ink"
                />
                <button
                  type="button"
                  disabled={isValidatingPromo}
                  onClick={() => handleApplyPromo(promoInput)}
                  className="h-10 shrink-0 rounded-xl bg-ink px-3.5 font-mono text-[10px] font-medium tracking-wider text-canvas hover:bg-accent"
                >
                  {isValidatingPromo ? "…" : "APPLY"}
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_PROMOS.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleApplyPromo(code)}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 font-mono text-[9px] tracking-wider transition-colors",
                      appliedPromo?.code === code
                        ? "border-sage bg-sage text-canvas"
                        : "border-line bg-surface text-ink hover:border-ink",
                    )}
                  >
                    [{code}]
                  </button>
                ))}
              </div>

              {promoError && (
                <p className="mt-2 font-mono text-[9.5px] tracking-wider text-accent">
                  {promoError}
                </p>
              )}

              {appliedPromo && baseFinancials.discountAmountUsd > 0 && (
                <div className="mt-2.5 flex items-center justify-between rounded-xl border border-sage/45 bg-sage/10 px-3 py-1.5 font-mono text-[9.5px] tracking-wider text-sage">
                  <span>
                    ✓ {appliedPromo.code} ({appliedPromo.discount_percent}% OFF) — −
                    {formatPrice(baseFinancials.discountAmountUsd, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-ink hover:text-accent"
                  >
                    [REMOVE ×]
                  </button>
                </div>
              )}
            </div>

            {/* Complete Financial Ledger (JetBrains Mono) */}
            <dl className="space-y-2.5 border-t border-line pt-4 font-mono text-[11px] tracking-[0.14em]">
              <div className="flex items-center justify-between text-muted">
                <dt>ARCHIVE SUBTOTAL</dt>
                <dd className="tabular text-ink">
                  {formatPrice(baseFinancials.subtotalUsd, currency)}
                </dd>
              </div>

              <div className="flex items-center justify-between text-sage">
                <dt>
                  COLLECTOR PRIVILEGE DISCOUNT
                  {appliedPromo ? ` (${appliedPromo.code})` : ""}
                </dt>
                <dd className="tabular">
                  −{formatPrice(baseFinancials.discountAmountUsd, currency)}
                </dd>
              </div>

              <div className="flex items-center justify-between text-muted">
                <dt>INSURED AIR DISPATCH</dt>
                <dd className="tabular text-ink">
                  {effectiveShippingUsd === 0 ? (
                    <span className="text-sage">COMPLIMENTARY</span>
                  ) : (
                    formatPrice(effectiveShippingUsd, currency)
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between text-muted">
                <dt>ESTIMATED DUTIES &amp; VAT (DDP INCLUDED)</dt>
                <dd className="tabular text-ink">{formatPrice(0, currency)}</dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="text-[12px] font-medium text-ink">TOTAL AUTHORIZATION</dt>
                <dd
                  data-testid="checkout-total-authorization"
                  className="tabular font-mono text-[24px] font-medium text-ink"
                >
                  {formatPrice(effectiveGrandTotalUsd, currency)}
                </dd>
              </div>
            </dl>

            {submitError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-accent/45 bg-accent/10 p-3 font-mono text-[10.5px] tracking-wider text-accent"
              >
                {submitError}
              </p>
            )}

            <MagneticButton
              type="submit"
              size="lg"
              variant="primary"
              disabled={isSubmitting}
              className="mt-6 w-full"
            >
              {isSubmitting ? (
                <span>ENCRYPTING &amp; ALLOCATING SERIALIZED STOCK...</span>
              ) : (
                <>
                  <Check className="size-4" strokeWidth={2} />
                  <span>
                    Authorize &amp; Dispatch Order —{" "}
                    <span className="tabular font-mono">
                      {formatPrice(effectiveGrandTotalUsd, currency)}
                    </span>
                  </span>
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </>
              )}
            </MagneticButton>

            <p className="mt-3.5 text-center font-mono text-[9.5px] tracking-[0.15em] text-muted">
              WRITES DIRECTLY TO LIVE SUPABASE PUBLIC.ORDERS &amp; PUBLIC.ORDER_ITEMS
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
