import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAdminStudioSnapshotAction } from "@/app/actions/admin";
import { AdminStudioClient } from "@/components/admin/AdminStudioClient";

export const metadata: Metadata = {
  title: "No-Code Merchant Studio (/admin)",
  description:
    "Manage live AETHERIA revenue telemetry, product inventory, Supabase Storage studio photography, collector order dispatches, and privilege discount codes.",
};

async function AdminStudioLoader() {
  const snapshot = await fetchAdminStudioSnapshotAction();
  return <AdminStudioClient initialSnapshot={snapshot} />;
}

export default function AdminStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1600px] px-5 py-24 font-mono text-[11px] tracking-[0.2em] text-muted md:px-8">
          INITIALIZING LIVE SUPABASE MERCHANT STUDIO…
        </div>
      }
    >
      <AdminStudioLoader />
    </Suspense>
  );
}
