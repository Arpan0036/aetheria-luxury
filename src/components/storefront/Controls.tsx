"use client";

import { useUIStore } from "@/store/useUIStore";
import { CURRENCIES, cn, type CurrencyCode } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

const CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function CurrencySelector({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  const active = useUIStore((s) => s.activeCurrency);
  const setCurrency = useUIStore((s) => s.setCurrency);
  return (
    <div role="radiogroup" aria-label="Currency" className={cn("inline-flex items-center gap-0.5 font-mono text-[11px] tracking-wider", className)}>
      {CODES.map((code) => {
        const on = code === active;
        return (
          <button
            key={code}
            role="radio"
            aria-checked={on}
            onClick={() => setCurrency(code)}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors duration-300",
              tone === "inverse"
                ? on
                  ? "bg-canvas text-ink"
                  : "text-canvas/60 hover:text-canvas"
                : on
                  ? "bg-ink text-canvas"
                  : "text-muted hover:text-ink",
            )}
          >
            {CURRENCIES[code].label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Two-state Daylight / Espresso switch. Active styling is driven by the
 * html[data-theme] attribute via CSS variants, so it is correct before hydration.
 */
export function ThemeSwitcher({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  const setTheme = useUIStore((s) => s.setTheme);
  const theme = useUIStore((s) => s.theme);
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors duration-300";
  const offCls = tone === "inverse" ? "text-canvas/60 hover:text-canvas" : "text-muted hover:text-ink";
  return (
    <div role="group" aria-label="Colour theme" className={cn("inline-flex items-center gap-0.5 font-mono text-[11px] tracking-wider", className)}>
      <button
        aria-pressed={theme === "daylight"}
        onClick={() => setTheme("daylight")}
        className={cn(base, offCls, tone === "inverse" ? "daylight:bg-canvas daylight:text-ink" : "daylight:bg-ink daylight:text-canvas")}
      >
        <Sun aria-hidden className="size-3" strokeWidth={1.75} />
        DAYLIGHT
      </button>
      <button
        aria-pressed={theme === "espresso"}
        onClick={() => setTheme("espresso")}
        className={cn(base, offCls, tone === "inverse" ? "espresso:bg-canvas espresso:text-ink" : "espresso:bg-ink espresso:text-canvas")}
      >
        <Moon aria-hidden className="size-3" strokeWidth={1.75} />
        ESPRESSO
      </button>
    </div>
  );
}
