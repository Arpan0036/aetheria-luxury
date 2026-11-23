"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Check, Plus, Tag, Trash2 } from "lucide-react";
import {
  createAdminDiscountCodeAction,
  deleteAdminDiscountCodeAction,
  toggleAdminDiscountActiveAction,
} from "@/app/actions/admin";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { DiscountCode } from "@/types/database";

export function AdminDiscountsTab({
  discountCodes,
  onDiscountCodesChange,
}: {
  discountCodes: DiscountCode[];
  onDiscountCodesChange: (next: DiscountCode[]) => void;
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [minOrderUsd, setMinOrderUsd] = useState("150");
  const [description, setDescription] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setToastMsg(null);

    startTransition(async () => {
      const res = await createAdminDiscountCodeAction({
        code,
        discountPercent: Number(discountPercent) || 10,
        minOrderUsd: Number(minOrderUsd) || 0,
        description,
      });

      if (!res.ok || !res.discount) {
        setErrorMsg(res.error ?? "Failed to issue privilege code.");
        return;
      }

      const saved = res.discount;
      const exists = discountCodes.some((d) => d.id === saved.id || d.code === saved.code);
      const next = exists
        ? discountCodes.map((d) => (d.id === saved.id || d.code === saved.code ? saved : d))
        : [saved, ...discountCodes];

      onDiscountCodesChange(next);
      setCode("");
      setDescription("");
      setToastMsg(
        `✓ PRIVILEGE CODE '${saved.code}' (${saved.discount_percent}% OFF) ISSUED IN LIVE SUPABASE`,
      );
    });
  };

  const handleToggleActive = (item: DiscountCode) => {
    const nextActive = !item.is_active;
    onDiscountCodesChange(
      discountCodes.map((d) => (d.id === item.id ? { ...d, is_active: nextActive } : d)),
    );

    startTransition(async () => {
      const res = await toggleAdminDiscountActiveAction(item.id, nextActive);
      if (res.ok) {
        setToastMsg(
          `✓ CODE '${item.code}' ${nextActive ? "ACTIVATED" : "PAUSED"} IN LIVE SUPABASE`,
        );
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    });
  };

  const handleDelete = (item: DiscountCode) => {
    onDiscountCodesChange(discountCodes.filter((d) => d.id !== item.id));
    startTransition(async () => {
      const res = await deleteAdminDiscountCodeAction(item.id);
      if (res.ok) {
        setToastMsg(`✓ CODE '${item.code}' REMOVED FROM LIVE SUPABASE`);
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* "+ Issue New Privilege Code" Creator Bar */}
      <section
        aria-label="Issue New Privilege Code"
        className="rounded-[26px] border border-line-strong bg-surface p-6"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
              + ISSUE NEW PRIVILEGE CODE // PUBLIC.DISCOUNT_CODES
            </p>
            <h2 className="mt-1 font-display text-[28px] leading-none text-ink">
              Commission Collector Discount Code
            </h2>
          </div>
          <span className="font-mono text-[10px] tracking-wider text-muted">
            ACTIVE IMMEDIATELY IN CART DRAWER &amp; /CHECKOUT
          </span>
        </div>

        <form onSubmit={handleCreateCode} className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <label
              htmlFor="new-promo-code"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
            >
              CODE (AUTO-UPPERCASED) *
            </label>
            <input
              id="new-promo-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., STUDIO10"
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[12.5px] uppercase tracking-wider text-ink outline-none focus:border-ink"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="new-promo-percent"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
            >
              DISCOUNT % *
            </label>
            <input
              id="new-promo-percent"
              type="number"
              min={1}
              max={90}
              required
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="tabular h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[13px] text-ink outline-none focus:border-ink"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="new-promo-min"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
            >
              MIN ORDER (USD) *
            </label>
            <input
              id="new-promo-min"
              type="number"
              min={0}
              step="10"
              required
              value={minOrderUsd}
              onChange={(e) => setMinOrderUsd(e.target.value)}
              className="tabular h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[13px] text-ink outline-none focus:border-ink"
            />
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="new-promo-desc"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
            >
              DESCRIPTION
            </label>
            <input
              id="new-promo-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 10% Studio Collector Privilege"
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 text-[13px] text-ink outline-none focus:border-ink"
            />
          </div>

          <div className="flex items-end md:col-span-2">
            <MagneticButton
              type="submit"
              size="md"
              variant="primary"
              disabled={isPending}
              className="h-11 w-full"
            >
              <Plus className="size-4" strokeWidth={2} />
              Issue Code
            </MagneticButton>
          </div>
        </form>

        {errorMsg && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-accent/45 bg-accent/10 px-3.5 py-2 font-mono text-[10px] text-accent"
          >
            {errorMsg}
          </p>
        )}
      </section>

      {/* Confirmation Toast */}
      {toastMsg && (
        <div
          role="status"
          data-testid="admin-discounts-toast"
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

      {/* Live Codes Ledger */}
      <section
        aria-label="Live Privilege Codes Ledger"
        className="rounded-[26px] border border-line bg-surface p-4 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
          <span>{discountCodes.length} PRIVILEGE CODES IN LIVE SUPABASE</span>
          <span>REAL-TIME ACTIVE / PAUSED SWITCH</span>
        </div>

        <ul className="space-y-3" aria-label="Discount codes list">
          {discountCodes.map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-[20px] border border-line bg-canvas p-4 transition-colors hover:border-line-strong sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3.5">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-accent">
                  <Tag className="size-4" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-lg bg-ink px-3 py-1 font-mono text-[12px] font-semibold tracking-[0.16em] text-canvas">
                      {item.code}
                    </span>
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
                      {item.discount_percent}% OFF
                    </span>
                    <span className="tabular font-mono text-[10.5px] text-muted">
                      MIN ORDER: {formatPrice(item.min_order_usd, currency)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] text-muted">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-line pt-3 sm:border-t-0 sm:pt-0">
                {/* Interactive Active / Paused Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.is_active}
                  aria-label={`Toggle active status for ${item.code}`}
                  data-testid={`toggle-discount-${item.code}`}
                  onClick={() => handleToggleActive(item)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 font-mono text-[10px] font-medium tracking-wider transition-all",
                    item.is_active
                      ? "border-sage/45 bg-sage/10 text-sage"
                      : "border-line-strong bg-surface text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      item.is_active ? "bg-sage" : "bg-muted",
                    )}
                  />
                  <span>{item.is_active ? "ACTIVE" : "PAUSED"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  aria-label={`Delete discount code ${item.code}`}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
