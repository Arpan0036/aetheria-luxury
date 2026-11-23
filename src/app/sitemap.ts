import type { MetadataRoute } from "next";
import { getCatalogOverview } from "@/lib/supabase/queries";
import { DEFAULT_SITE_URL } from "@/lib/seo/json-ld";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = DEFAULT_SITE_URL;
  const now = new Date();
  const overview = await getCatalogOverview();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/shipping-returns`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = overview.categories.map(
    (category) => ({
      url: `${base}/shop?category=${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    }),
  );

  const productRoutes: MetadataRoute.Sitemap = overview.products.map(
    (product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: product.is_featured || product.is_bestseller ? 0.9 : 0.85,
    }),
  );

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
