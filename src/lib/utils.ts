import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyCode = "USD" | "GBP" | "EUR";

export const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; label: string; rate: number; locale: string }
> = {
  USD: { symbol: "$", label: "USD $", rate: 1, locale: "en-US" },
  GBP: { symbol: "£", label: "GBP £", rate: 0.79, locale: "en-GB" },
  EUR: { symbol: "€", label: "EUR €", rate: 0.92, locale: "de-DE" },
};

/** Deterministic (SSR-safe) price formatting — base prices are stored in USD. */
export function formatPrice(usd: number, code: CurrencyCode) {
  const { symbol, rate } = CURRENCIES[code];
  const value = Math.round(usd * rate);
  const grouped = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${grouped}.00`;
}

export const THEME_STORAGE_KEY = "aetheria-theme";
