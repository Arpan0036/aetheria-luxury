import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchCollectorDossierAction } from "@/app/actions/account";
import { AccountPortalClient } from "@/components/storefront/AccountPortalClient";
import { getCatalogOverview } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Collector Sanctuary & Auth Portal (/account)",
  description:
    "Manage your AETHERIA 3D Titanium Collector Pass, serialized order telemetry, 10-year hardware warranty certificates, and default DDP dispatch coordinates.",
};

async function AccountPortalLoader() {
  const [dossier, overview] = await Promise.all([
    fetchCollectorDossierAction(),
    getCatalogOverview(),
  ]);

  return (
    <AccountPortalClient
      initialProfile={dossier.profile}
      initialOrders={dossier.orders}
      catalogProducts={overview.products}
    />
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-5 py-24 font-mono text-[11px] tracking-[0.2em] text-muted md:px-8">
          LOADING LIVE SUPABASE COLLECTOR SANCTUARY…
        </div>
      }
    >
      <AccountPortalLoader />
    </Suspense>
  );
}
