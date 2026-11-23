/**
 * AETHERIA unified data-access layer.
 *
 * Every function queries live Supabase PostgreSQL when credentials are present
 * and the catalog is reachable + seeded; otherwise it transparently returns the
 * identical typed seed dataset from `fallback-data.ts`. Callers never branch.
 */
import { cacheLife, cacheTag } from "next/cache";
import type {
  CatalogOverview,
  CatalogProduct,
  Category,
  CategorySlug,
  ConnectionMode,
  DatabaseStatus,
  DiscountCode,
  DiscountValidation,
  Product,
  ProductDetail,
  ProductQuery,
  ProductVariant,
  Review,
} from "@/types/database";
import { createPublicClient } from "./server";
import { queryProducts } from "@/lib/catalog-query";
export { queryProducts };
import {
  SEED_CATEGORIES,
  SEED_DISCOUNT_CODES,
  SEED_PRODUCTS,
  SEED_REVIEWS,
  SEED_VARIANTS,
} from "./fallback-data";

const QUERY_TIMEOUT_MS = 4000;

/* -------------------------------------------------------------------------- */
/*  Row normalisers (Postgres numeric → number, null-safe arrays/json)         */
/* -------------------------------------------------------------------------- */

type Row = Record<string, unknown>;
const num = (v: unknown, d = 0) => (v === null || v === undefined ? d : Number(v));

function toCategory(r: Row): Category {
  return {
    id: String(r.id),
    name: String(r.name),
    slug: r.slug as CategorySlug,
    subtitle: String(r.subtitle ?? ""),
    description: String(r.description ?? ""),
    image_url: (r.image_url as string | null) ?? null,
    display_order: num(r.display_order),
  };
}

function toProduct(r: Row): Product {
  return {
    id: String(r.id),
    category_id: String(r.category_id),
    sku: String(r.sku),
    title: String(r.title),
    slug: String(r.slug),
    tagline: String(r.tagline ?? ""),
    description: String(r.description ?? ""),
    price_usd: num(r.price_usd),
    compare_at_price_usd: r.compare_at_price_usd == null ? null : num(r.compare_at_price_usd),
    rating: num(r.rating),
    review_count: num(r.review_count),
    stock_count: num(r.stock_count),
    is_featured: Boolean(r.is_featured),
    is_bestseller: Boolean(r.is_bestseller),
    is_new_arrival: Boolean(r.is_new_arrival),
    materials: (r.materials as string[]) ?? [],
    dimensions: String(r.dimensions ?? ""),
    weight: String(r.weight ?? ""),
    warranty_info: String(r.warranty_info ?? ""),
    specs: (r.specs as Product["specs"]) ?? {},
    images: (r.images as string[]) ?? [],
    three_d_config: r.three_d_config as Product["three_d_config"],
  };
}

function toVariant(r: Row): ProductVariant {
  return {
    id: String(r.id),
    product_id: String(r.product_id),
    sku: String(r.sku),
    variant_name: String(r.variant_name),
    color_hex: String(r.color_hex),
    price_modifier_usd: num(r.price_modifier_usd),
    stock_count: num(r.stock_count),
  };
}

function toReview(r: Row): Review {
  return {
    id: String(r.id),
    product_id: String(r.product_id),
    author_name: String(r.author_name),
    author_city: String(r.author_city ?? ""),
    rating: num(r.rating, 5) as Review["rating"],
    title: String(r.title ?? ""),
    comment: String(r.comment ?? ""),
    verified_purchase: Boolean(r.verified_purchase),
    created_at: String(r.created_at),
  };
}

function toDiscount(r: Row): DiscountCode {
  return {
    id: String(r.id),
    code: String(r.code),
    description: String(r.description ?? ""),
    discount_percent: num(r.discount_percent),
    min_order_usd: num(r.min_order_usd),
    is_active: Boolean(r.is_active),
    expires_at: (r.expires_at as string | null) ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Assembly helpers                                                           */
/* -------------------------------------------------------------------------- */

function assemble(
  categories: Category[],
  products: Product[],
  variants: ProductVariant[],
  status: DatabaseStatus,
): CatalogOverview {
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  const catalog: CatalogProduct[] = products.map((p) => ({
    ...p,
    category_slug: slugById.get(p.category_id) as CategorySlug,
    variants: variants.filter((v) => v.product_id === p.id),
  }));
  return {
    status,
    categories: [...categories]
      .sort((a, b) => a.display_order - b.display_order)
      .map((c) => ({ ...c, product_count: catalog.filter((p) => p.category_id === c.id).length })),
    products: catalog,
  };
}

function fallbackOverview(reason: string): CatalogOverview {
  return assemble(SEED_CATEGORIES, SEED_PRODUCTS, SEED_VARIANTS, {
    mode: "local-fallback",
    reason,
    rlsEnabled: true,
    checkedAt: new Date().toISOString(),
  });
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

/** Categories + all products (with variants) + the active connection mode. */
export async function getCatalogOverview(): Promise<CatalogOverview> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  const supabase = createPublicClient();
  if (!supabase) return fallbackOverview("Supabase credentials not configured");

  try {
    const signal = AbortSignal.timeout(QUERY_TIMEOUT_MS);
    const [cats, prods, vars] = await Promise.all([
      supabase.from("categories").select("*").order("display_order").abortSignal(signal),
      supabase.from("products").select("*").abortSignal(signal),
      supabase.from("product_variants").select("*").order("sku").abortSignal(signal),
    ]);
    const error = cats.error ?? prods.error ?? vars.error;
    if (error) return fallbackOverview(`Supabase query failed: ${error.message}`);
    if (!prods.data?.length || !cats.data?.length) {
      return fallbackOverview("Supabase reachable but catalog is not seeded (run supabase/seed.sql)");
    }
    return assemble(
      cats.data.map(toCategory),
      prods.data.map(toProduct),
      (vars.data ?? []).map(toVariant),
      { mode: "supabase-live", reason: null, rlsEnabled: true, checkedAt: new Date().toISOString() },
    );
  } catch (err) {
    return fallbackOverview(`Supabase unreachable: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getCategories() {
  const { categories } = await getCatalogOverview();
  return categories;
}

export async function getProducts(q: ProductQuery = {}) {
  const { products } = await getCatalogOverview();
  return queryProducts(products, q);
}

/** Full product detail with category, variants and reviews. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog", `product:${slug}`);

  const supabase = createPublicClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*), reviews(*)")
        .eq("slug", slug)
        .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS))
        .maybeSingle();
      if (!error && data) {
        const row = data as Row & { category: Row; variants: Row[]; reviews: Row[] };
        const category = toCategory(row.category);
        return {
          ...toProduct(row),
          category,
          category_slug: category.slug,
          variants: row.variants.map(toVariant).sort((a, b) => a.sku.localeCompare(b.sku)),
          reviews: row.reviews.map(toReview).sort((a, b) => b.created_at.localeCompare(a.created_at)),
        };
      }
      if (!error && !data) {
        // Live DB answered: if it is seeded, the slug genuinely doesn't exist.
        const { count } = await supabase.from("products").select("id", { count: "exact", head: true });
        if (count) return null;
      }
    } catch {
      /* fall through to local data */
    }
  }

  const product = SEED_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;
  const category = SEED_CATEGORIES.find((c) => c.id === product.category_id)!;
  return {
    ...product,
    category,
    category_slug: category.slug,
    variants: SEED_VARIANTS.filter((v) => v.product_id === product.id),
    reviews: SEED_REVIEWS.filter((r) => r.product_id === product.id),
  };
}

function evaluateDiscount(
  code: string,
  found: DiscountCode | null,
  subtotal: number,
  mode: ConnectionMode,
): DiscountValidation {
  if (!found) return { valid: false, code, reason: "not-found", message: "This code isn’t recognised.", mode };
  if (!found.is_active) return { valid: false, code, reason: "inactive", message: "This code is no longer active.", mode };
  if (found.expires_at && new Date(found.expires_at).getTime() < Date.now()) {
    return { valid: false, code, reason: "expired", message: "This code has expired.", mode };
  }
  if (subtotal < found.min_order_usd) {
    return {
      valid: false,
      code,
      reason: "below-minimum",
      message: `Requires a subtotal of $${found.min_order_usd.toFixed(2)} or more.`,
      min_order_usd: found.min_order_usd,
      mode,
    };
  }
  const discount = Math.round(subtotal * found.discount_percent) / 100;
  return {
    valid: true,
    code: found.code,
    description: found.description,
    discount_percent: found.discount_percent,
    min_order_usd: found.min_order_usd,
    discount_usd: discount,
    new_subtotal_usd: Math.round((subtotal - discount) * 100) / 100,
    mode,
  };
}

/** Validates a promo code against live `discount_codes` (RLS: active only) or seed data. */
export async function validateDiscountCode(rawCode: string, cartSubtotalUsd: number): Promise<DiscountValidation> {
  const code = rawCode.trim().toUpperCase().slice(0, 32);
  const subtotal = Number.isFinite(cartSubtotalUsd) ? Math.max(0, cartSubtotalUsd) : 0;
  const supabase = createPublicClient();

  if (!code) {
    return {
      valid: false,
      code,
      reason: "empty",
      message: "Enter a code to validate.",
      mode: supabase ? "supabase-live" : "local-fallback",
    };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", code)
        .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS))
        .maybeSingle();
      if (!error) return evaluateDiscount(code, data ? toDiscount(data) : null, subtotal, "supabase-live");
    } catch {
      /* fall through */
    }
  }
  const found = SEED_DISCOUNT_CODES.find((d) => d.code === code) ?? null;
  return evaluateDiscount(code, found, subtotal, "local-fallback");
}
