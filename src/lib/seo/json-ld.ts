import type { Product, ProductVariant, Review } from "@/types/database";

export const DEFAULT_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

function toAbsoluteUrl(pathOrUrl: string, siteUrl = DEFAULT_SITE_URL): string {
  const base = siteUrl.replace(/\/$/, "");
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${cleanPath}`;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

/**
 * Organization JSON-LD schema for AETHERIA Archive Holdings.
 */
export function getOrganizationSchema(siteUrl = DEFAULT_SITE_URL) {
  const base = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: "AETHERIA Archive Holdings",
    legalName: "AETHERIA Objects Ltd.",
    alternateName: "AETHERIA®",
    url: base,
    logo: {
      "@type": "ImageObject",
      url: toAbsoluteUrl("/images/products/aether-01-headphones.png", base),
      width: 1200,
      height: 1200,
    },
    description:
      "AETHERIA is an architectural audio and desk object atelier founded in Zurich and Copenhagen, engineering permanent hardware from 5-axis CNC aluminum, Roman travertine, and brushed titanium.",
    foundingDate: "2026",
    foundingLocation: [
      { "@type": "Place", name: "Zurich, Switzerland" },
      { "@type": "Place", name: "Copenhagen, Denmark" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Private Client Concierge",
        email: "concierge@aetheria.studio",
        telephone: "+41-44-580-2601",
        areaServed: ["US", "GB", "CH", "DE", "FR", "NL", "DK", "SE", "CA", "AU", "NZ"],
        availableLanguage: ["English", "German", "French"],
      },
    ],
    sameAs: [
      "https://www.instagram.com/aetheria.studio",
      "https://x.com/aetheria_studio",
      "https://www.linkedin.com/company/aetheria-archive-holdings",
    ],
  };
}

/**
 * WebSite JSON-LD schema with SearchAction pointing to /shop?q={search_term_string}.
 */
export function getWebsiteSchema(siteUrl = DEFAULT_SITE_URL) {
  const base = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: "AETHERIA® — Architectural Audio & Desk Objects",
    publisher: {
      "@id": `${base}/#organization`,
    },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Complete Google Shopping Rich Result Product + Offer + AggregateRating + Review JSON-LD schema.
 */
export function getProductSchema(
  product: Product,
  variants: ProductVariant[] = [],
  reviews: Review[] = [],
  siteUrl = DEFAULT_SITE_URL,
) {
  const base = siteUrl.replace(/\/$/, "");
  const productUrl = `${base}/product/${product.slug}`;
  const images =
    product.images.length > 0
      ? product.images.map((img) => toAbsoluteUrl(img, base))
      : [toAbsoluteUrl("/images/products/aether-01-headphones.png", base)];

  const totalVariantStock =
    variants.length > 0
      ? variants.reduce((sum, v) => sum + Math.max(0, v.stock_count), 0)
      : product.stock_count;
  const inStock = product.stock_count > 0 || totalVariantStock > 0;
  const availabilityUrl = inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const reviewCount = Math.max(product.review_count, reviews.length, 1);
  const ratingValue =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(2),
        )
      : Number(product.rating.toFixed(2));

  const mainOffer = {
    "@type": "Offer",
    url: productUrl,
    priceCurrency: "USD",
    price: product.price_usd.toFixed(2),
    priceValidUntil: "2027-12-31",
    availability: availabilityUrl,
    itemCondition: "https://schema.org/NewCondition",
    sku: product.sku,
    seller: {
      "@type": "Organization",
      name: "AETHERIA Archive Holdings",
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: product.price_usd >= 150 ? "0.00" : "25.00",
        currency: "USD",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: ["US", "GB", "DE", "FR", "CH", "CA", "AU"],
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 1,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 2,
          maxValue: 5,
          unitCode: "DAY",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: ["US", "GB", "DE", "FR", "CH", "CA", "AU"],
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.title,
    description: `${product.tagline} — ${product.description}`,
    sku: product.sku,
    mpn: product.sku,
    image: images,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "AETHERIA®",
    },
    material: product.materials.join(", "),
    offers: mainOffer,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      bestRating: "5",
      worstRating: "1",
      reviewCount: String(reviewCount),
    },
    review: reviews.slice(0, 8).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.author_name,
      },
      datePublished: r.created_at.slice(0, 10),
      name: r.title,
      reviewBody: r.comment,
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
        worstRating: "1",
      },
    })),
  };
}

/**
 * BreadcrumbList JSON-LD schema for /shop and /product/[slug].
 */
export function getBreadcrumbSchema(
  items: BreadcrumbItem[],
  siteUrl = DEFAULT_SITE_URL,
) {
  const base = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: entry.name,
      item: toAbsoluteUrl(entry.item, base),
    })),
  };
}
