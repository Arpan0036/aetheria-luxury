"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles, Tag, X } from "lucide-react";
import { validateDiscountAction } from "@/app/actions/discount";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { DiscountValidation } from "@/types/database";

const PRESET_CODES = [
  { code: "AETHERIA15", hint: "15% OFF · MIN $100" },
  { code: "TIER1VIP", hint: "20% OFF · MIN $300" },
  { code: "FREESHIP", hint: "10% WELCOME · NO MIN" },
];

const DEMO_SUBTOTALS = [180, 420, 890];

export function PromoCodeTester() {
  const currency = useUIStore((s) => s.activeCurrency);
  const [code, setCode] = useState("AETHERIA15");
  const [subtotalUsd, setSubtotalUsd] = useState(420);
  const [result, setResult] = useState<DiscountValidation | null>(null);
  const [isPending, startTransition] = useTransition();

  const runValidation = (targetCode: string, targetSubtotal = subtotalUsd) => {
    setCode(targetCode);
    startTransition(async () => {
      const res = await validateDiscountAction(targetCode, targetSubtotal);
      setResult(res);
    });
  };

  return (
    <div className="mt-12 rounded-[22px] border border-line bg-surface p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-ink">
              <Tag className="size-3 text-accent" strokeWidth={1.75} />
              LIVE PROMO CODE VALIDATOR
            </span>
            <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
              QUERIES `discount_codes` TABLE · RLS ACTIVE
            </span>
          </div>
          <h3 className="mt-3 font-display text-[32px] text-ink sm:text-[38px]">
            Verify privileges &amp; tier <em className="text-accent">discounts</em>.
          </h3>
          <p className="mt-1 text-[13.5px] text-muted">
            Click a seeded code pill or type any code to test live minimum-order &amp; percentage rules against the data layer.
          </p>
        </div>

        {/* Preset code pills */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_CODES.map((preset) => {
            const active = code.trim().toUpperCase() === preset.code;
            return (
              <button
                key={preset.code}
                type="button"
                onClick={() => runValidation(preset.code, subtotalUsd)}
                className={cn(
                  "group flex flex-col items-start rounded-2xl border px-3.5 py-2 text-left transition-colors",
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong bg-canvas text-ink hover:border-ink",
                )}
              >
                <span className="font-mono text-[11px] font-medium tracking-wider">{preset.code}</span>
                <span className={cn("font-mono text-[9px] tracking-wider", active ? "text-canvas/70" : "text-muted")}>
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive form row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runValidation(code, subtotalUsd);
        }}
        className="mt-6 grid gap-3 border-t border-line pt-6 md:grid-cols-[1fr_auto_auto] md:items-center"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="promo-code-input" className="sr-only">
            Promo code
          </label>
          <input
            id="promo-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE (E.G. AETHERIA15)"
            className="h-12 min-w-0 flex-1 rounded-full border border-line-strong bg-canvas px-5 font-mono text-[13px] tracking-wider text-ink uppercase outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
          />

          {/* Simulated subtotal selector */}
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas p-1 font-mono text-[11px]">
            <span className="px-2.5 text-[10px] tracking-wider text-muted">BAG:</span>
            {DEMO_SUBTOTALS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSubtotalUsd(amt);
                  if (code.trim()) runValidation(code, amt);
                }}
                className={cn(
                  "rounded-full px-2.5 py-1 transition-colors tabular",
                  subtotalUsd === amt ? "bg-ink text-canvas" : "text-muted hover:text-ink",
                )}
              >
                {formatPrice(amt, currency)}
              </button>
            ))}
          </div>
        </div>

        <MagneticButton type="submit" size="md" disabled={isPending}>
          <Sparkles className="size-3.5" strokeWidth={1.75} />
          {isPending ? "Validating…" : "Validate Code"}
        </MagneticButton>
      </form>

      {/* Validation result readout */}
      {result && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-3 font-mono text-[11.5px]",
            result.valid
              ? "border-sage/45 bg-canvas text-sage"
              : "border-accent/45 bg-canvas text-accent",
          )}
        >
          <div className="flex items-center gap-2.5">
            {result.valid ? (
              <Check className="size-4 shrink-0" strokeWidth={2} />
            ) : (
              <X className="size-4 shrink-0" strokeWidth={2} />
            )}
            <span>
              <strong>{result.code || "EMPTY"}</strong>
              {" — "}
              {result.valid
                ? `${result.description} (-${result.discount_percent}%)`
                : result.message}
            </span>
          </div>
          {result.valid && (
            <div className="tabular flex items-center gap-4 text-ink">
              <span className="text-muted">
                SAVINGS: <strong className="text-sage">-{formatPrice(result.discount_usd, currency)}</strong>
              </span>
              <span>
                NET TOTAL: <strong>{formatPrice(result.new_subtotal_usd, currency)}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
