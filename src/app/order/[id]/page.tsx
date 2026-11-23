import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";
import { OrderConfirmationClient } from "@/components/storefront/OrderConfirmationClient";
import { getOrderByIdentifier } from "@/lib/supabase/orders";

export const metadata: Metadata = {
  title: "Live Order Telemetry & Tax Invoice (/order)",
  description:
    "Inspect live Supabase order dispatch status, 4-stage shipment telemetry, and printable DDP commercial tax invoice.",
};

async function OrderDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderByIdentifier(id);

  if (!order) {
    return (
      <div className="mx-auto max-w-[960px] px-5 py-24 text-center md:px-8">
        <div className="rounded-[28px] border border-line-strong bg-surface p-8 md:p-12">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-line-strong bg-canvas text-accent">
            <PackageSearch className="size-6" strokeWidth={1.5} />
          </div>
          <p className="mt-4 font-mono text-[10.5px] tracking-[0.2em] text-accent">
            ARCHIVE TELEMETRY LOOKUP // NO RECORD MATCHED “{decodeURIComponent(id)}”
          </p>
          <h1 className="mt-2 font-display text-[40px] leading-none text-ink sm:text-[52px]">
            Order Dossier Not Found
          </h1>
          <p className="mx-auto mt-3 max-w-[32rem] text-[14.5px] leading-relaxed text-muted">
            Verify your serialized order reference (e.g., <code className="font-mono text-ink">AETH-2026-XXXX</code>) or
            complete a Private Concierge Checkout to generate a live Supabase order record.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/order/latest"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-mono text-[11px] font-medium tracking-wider text-canvas transition-colors hover:bg-accent"
            >
              Inspect Latest Live Order <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
            <Link
              href="/checkout"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-canvas px-6 font-mono text-[11px] font-medium tracking-wider text-ink transition-colors hover:border-ink"
            >
              Go to Private Checkout →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <OrderConfirmationClient order={order} />;
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-5 py-24 font-mono text-[11px] tracking-[0.2em] text-muted md:px-8">
          LOADING LIVE SUPABASE ORDER TELEMETRY &amp; COMMERCIAL TAX INVOICE…
        </div>
      }
    >
      <OrderDetailLoader params={params} />
    </Suspense>
  );
}
