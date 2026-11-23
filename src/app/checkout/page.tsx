import type { Metadata } from "next";
import { CheckoutClient } from "@/components/storefront/CheckoutClient";
import { getCatalogOverview } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Private Concierge Checkout (/checkout)",
  description:
    "Authorize insured DDP air dispatch for your AETHERIA collector instruments with live Supabase order persistence.",
};

export default async function CheckoutPage() {
  const overview = await getCatalogOverview();
  const flagshipProducts = overview.products.filter((p) => p.is_featured || p.is_bestseller);

  return <CheckoutClient flagshipProducts={flagshipProducts} />;
}
