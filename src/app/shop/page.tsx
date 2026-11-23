import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopArchiveClient } from "@/components/storefront/ShopArchiveClient";
import { getCatalogOverview } from "@/lib/supabase/queries";
import { DEFAULT_SITE_URL, getBreadcrumbSchema } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Permanent Object Archive (/shop)",
  description:
    "Explore the complete 12-object AETHERIA permanent collection across Spatial Audio, Desk Architecture, Tactile Computing, and Ambient Lighting.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Permanent Object Archive (/shop) | AETHERIA®",
    description:
      "Explore the complete 12-object AETHERIA permanent collection across Spatial Audio, Desk Architecture, Tactile Computing, and Ambient Lighting.",
    url: "/shop",
  },
};

export default async function ShopPage() {
  const overview = await getCatalogOverview();
  const breadcrumbJsonLd = getBreadcrumbSchema(
    [
      { name: "Home", item: "/" },
      { name: "Object Archive", item: "/shop" },
    ],
    DEFAULT_SITE_URL,
  );

  return (
    <>
      <script
        id="jsonld-shop-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1600px] px-5 py-20 font-mono text-[11px] tracking-[0.2em] text-muted md:px-8">
            LOADING LIVE SUPABASE OBJECT ARCHIVE…
          </div>
        }
      >
        <ShopArchiveClient overview={overview} />
      </Suspense>
    </>
  );
}
