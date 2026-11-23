import type { CatalogProduct, CategorySlug, ProductQuery } from "@/types/database";

export interface MaterialSwatchOption {
  id: string;
  label: string;
  hex: string;
  keywords: string[];
}

export const ARCHIVE_MATERIALS: MaterialSwatchOption[] = [
  {
    id: "anodized-aluminum",
    label: "Anodized Aluminum",
    hex: "#C9C6C0",
    keywords: ["aluminum", "anodized"],
  },
  {
    id: "roman-travertine",
    label: "Roman Travertine",
    hex: "#E3D6C1",
    keywords: ["travertine"],
  },
  {
    id: "brushed-brass",
    label: "Brushed Brass",
    hex: "#B8935A",
    keywords: ["brass", "bronze"],
  },
  {
    id: "obsidian-matte",
    label: "Obsidian Matte",
    hex: "#1F1E1C",
    keywords: ["obsidian", "basalt", "graphite", "nero"],
  },
  {
    id: "borosilicate-glass",
    label: "Borosilicate Glass",
    hex: "#EFE7DC",
    keywords: ["borosilicate", "glass", "sapphire"],
  },
  {
    id: "titanium",
    label: "Titanium",
    hex: "#6E6C68",
    keywords: ["titanium", "steel"],
  },
  {
    id: "saddle-leather",
    label: "Saddle Leather",
    hex: "#8A5A3B",
    keywords: ["leather", "lambskin"],
  },
];

const CATEGORY_NAMES: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio & Acoustics",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

export function matchesMaterialFilter(product: CatalogProduct, materialId: string): boolean {
  if (!materialId || materialId === "all") return true;
  const preset = ARCHIVE_MATERIALS.find(
    (m) => m.id === materialId || m.label.toLowerCase() === materialId.toLowerCase(),
  );
  const terms = preset ? preset.keywords : [materialId.toLowerCase()];

  const haystack = [
    ...product.materials,
    product.three_d_config.finish,
    ...product.variants.map((v) => v.variant_name),
  ]
    .join(" ")
    .toLowerCase();

  return terms.some((t) => haystack.includes(t));
}

/** Filter / sort / search over the cached or live catalog snapshot. */
export function queryProducts(products: CatalogProduct[], q: ProductQuery = {}): CatalogProduct[] {
  const {
    categorySlug = "all",
    featuredOnly = false,
    bestsellerOnly = false,
    newArrivalOnly = false,
    inStockOnly = false,
    minPriceUsd,
    maxPriceUsd,
    materialFilter = "",
    sortBy = "featured",
    searchQuery = "",
  } = q;

  const term = searchQuery.trim().toLowerCase();

  const list = products.filter((p) => {
    if (categorySlug !== "all" && p.category_slug !== categorySlug) return false;
    if (featuredOnly && !p.is_featured) return false;
    if (bestsellerOnly && !p.is_bestseller) return false;
    if (newArrivalOnly && !p.is_new_arrival) return false;
    if (inStockOnly && p.stock_count <= 0) return false;
    if (typeof minPriceUsd === "number" && p.price_usd < minPriceUsd) return false;
    if (typeof maxPriceUsd === "number" && p.price_usd > maxPriceUsd) return false;
    if (materialFilter && !matchesMaterialFilter(p, materialFilter)) return false;

    if (term) {
      const catName = CATEGORY_NAMES[p.category_slug] ?? p.category_slug;
      const hay = [
        p.title,
        p.sku,
        p.tagline,
        p.description,
        catName,
        ...p.materials,
        ...p.variants.map((v) => v.variant_name),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  const featuredScore = (p: CatalogProduct) =>
    (p.is_featured ? 4 : 0) + (p.is_bestseller ? 2 : 0) + (p.is_new_arrival ? 1 : 0);

  return [...list].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price_usd - b.price_usd;
      case "price-desc":
        return b.price_usd - a.price_usd;
      case "top-rated":
        return b.rating - a.rating || b.review_count - a.review_count;
      case "sku":
        return a.sku.localeCompare(b.sku);
      default:
        return featuredScore(b) - featuredScore(a) || a.sku.localeCompare(b.sku);
    }
  });
}
