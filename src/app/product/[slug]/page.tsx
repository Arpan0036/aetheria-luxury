import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { getCatalogOverview, getProductBySlug } from "@/lib/supabase/queries";
import {
  DEFAULT_SITE_URL,
  getBreadcrumbSchema,
  getProductSchema,
} from "@/lib/seo/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Object Not Found in Archive",
      description: "The requested serialized object coordinate could not be located in the AETHERIA archive.",
    };
  }
  const primaryImage = product.images[0] ?? "/images/products/aether-01-headphones.png";
  const priceDisplay = `$${product.price_usd.toLocaleString("en-US")}`;
  const fullDescription = `${product.tagline} — ${product.description} (${priceDisplay} USD · SKU ${product.sku}).`;

  return {
    title: `${product.title} (${product.sku}) — ${priceDisplay}`,
    description: fullDescription,
    keywords: [
      product.title,
      product.sku,
      product.category.name,
      ...product.materials,
      "AETHERIA",
      "luxury hardware",
    ],
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title: `${product.title} (${product.sku}) — ${priceDisplay} | AETHERIA®`,
      description: fullDescription,
      url: `/product/${product.slug}`,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 1200,
          alt: `${product.title} — ${product.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} (${product.sku}) — ${priceDisplay} | AETHERIA®`,
      description: fullDescription,
      images: [primaryImage],
    },
  };
}

async function ProductDetailLoader({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, overview] = await Promise.all([
    getProductBySlug(slug),
    getCatalogOverview(),
  ]);

  if (!product) {
    notFound();
  }

  const sameCategory = overview.products.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id,
  );
  const otherCurated = overview.products.filter(
    (p) => p.category_id !== product.category_id && p.id !== product.id,
  );
  const relatedProducts = [...sameCategory, ...otherCurated].slice(0, 3);

  const productJsonLd = getProductSchema(
    product,
    product.variants,
    product.reviews,
    DEFAULT_SITE_URL,
  );
  const breadcrumbJsonLd = getBreadcrumbSchema(
    [
      { name: "Home", item: "/" },
      { name: "Object Archive", item: "/shop" },
      {
        name: product.category.name,
        item: `/shop?category=${product.category.slug}`,
      },
      { name: product.title, item: `/product/${product.slug}` },
    ],
    DEFAULT_SITE_URL,
  );

  return (
    <>
      <script
        id="jsonld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        id="jsonld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-5 py-24 font-mono text-[11px] tracking-[0.2em] text-muted md:px-8">
          LOADING LIVE SUPABASE OBJECT SPECIFICATION…
        </div>
      }
    >
      <ProductDetailLoader params={params} />
    </Suspense>
  );
}
