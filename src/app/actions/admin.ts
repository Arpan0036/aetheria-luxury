"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import { normalizeOrderRow, SEED_ORDERS } from "@/lib/supabase/orders";
import {
  SEED_CATEGORIES,
  SEED_DISCOUNT_CODES,
  SEED_PRODUCTS,
  SEED_VARIANTS,
} from "@/lib/supabase/fallback-data";
import type {
  AdminStudioSnapshot,
  CatalogProduct,
  Category,
  CategorySlug,
  DiscountCode,
  OrderStatus,
  Product,
  ProductVariant,
  ThreeDConfig,
  UpsertProductInput,
} from "@/types/database";

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
    compare_at_price_usd:
      r.compare_at_price_usd == null ? null : num(r.compare_at_price_usd),
    rating: num(r.rating, 4.9),
    review_count: num(r.review_count, 12),
    stock_count: num(r.stock_count),
    is_featured: Boolean(r.is_featured),
    is_bestseller: Boolean(r.is_bestseller),
    is_new_arrival: Boolean(r.is_new_arrival),
    materials: (r.materials as string[]) ?? [],
    dimensions: String(r.dimensions ?? ""),
    weight: String(r.weight ?? ""),
    warranty_info: String(
      r.warranty_info ?? "5-year structural warranty · lifetime servicing",
    ),
    specs: (r.specs as Product["specs"]) ?? {},
    images: (r.images as string[]) ?? [],
    three_d_config: (r.three_d_config as ThreeDConfig) ?? {
      shape: "headphones",
      finish: "anodized-aluminum",
      metallic: 0.85,
      roughness: 0.3,
      base_hex: "#C9C6C0",
      accent_hex: "#C85632",
    },
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

function fallbackSnapshot(): AdminStudioSnapshot {
  const slugById = new Map(SEED_CATEGORIES.map((c) => [c.id, c.slug]));
  const products: CatalogProduct[] = SEED_PRODUCTS.map((p) => ({
    ...p,
    category_slug: (slugById.get(p.category_id) ?? "spatial-audio") as CategorySlug,
    variants: SEED_VARIANTS.filter((v) => v.product_id === p.id),
  }));
  return {
    mode: "local-fallback",
    categories: SEED_CATEGORIES,
    products,
    orders: SEED_ORDERS,
    discountCodes: SEED_DISCOUNT_CODES,
  };
}

function revalidateStorefront() {
  revalidateTag("catalog", "max");
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function fetchAdminStudioSnapshotAction(): Promise<AdminStudioSnapshot> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackSnapshot();

  try {
    const [catsRes, prodsRes, varsRes, ordersRes, codesRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("products").select("*").order("sku"),
      supabase.from("product_variants").select("*").order("sku"),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false }),
      supabase.from("discount_codes").select("*").order("code"),
    ]);

    if (catsRes.error || prodsRes.error || !prodsRes.data?.length) {
      return fallbackSnapshot();
    }

    const categories = (catsRes.data ?? []).map((r) => toCategory(r as Row));
    const variants = (varsRes.data ?? []).map((r) => toVariant(r as Row));
    const slugById = new Map(categories.map((c) => [c.id, c.slug]));

    const products: CatalogProduct[] = (prodsRes.data ?? []).map((r) => {
      const p = toProduct(r as Row);
      return {
        ...p,
        category_slug: (slugById.get(p.category_id) ?? "spatial-audio") as CategorySlug,
        variants: variants.filter((v) => v.product_id === p.id),
      };
    });

    const orders = (ordersRes.data ?? []).map((r) =>
      normalizeOrderRow(r as Row & { order_items?: Row[] }),
    );
    const discountCodes = (codesRes.data ?? []).map((r) => toDiscount(r as Row));

    return {
      mode: "supabase-live",
      categories,
      products,
      orders,
      discountCodes,
    };
  } catch {
    return fallbackSnapshot();
  }
}

export async function adjustProductStockInlineAction(
  productId: string,
  nextStock: number,
): Promise<{ ok: boolean; stockCount: number; error?: string }> {
  const clamped = Math.max(0, Math.round(nextStock));
  const supabase = createPublicClient();
  if (!supabase) return { ok: true, stockCount: clamped };

  try {
    const { data, error } = await supabase
      .from("products")
      .update({ stock_count: clamped })
      .eq("id", productId)
      .select("stock_count")
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        stockCount: clamped,
        error: error?.message ?? "Failed to update stock count.",
      };
    }

    revalidateStorefront();
    return {
      ok: true,
      stockCount: num((data as Row).stock_count, clamped),
    };
  } catch (err) {
    return {
      ok: false,
      stockCount: clamped,
      error: err instanceof Error ? err.message : "Failed to update stock.",
    };
  }
}

export async function toggleProductFlagInlineAction(
  productId: string,
  field: "is_featured" | "is_bestseller" | "is_new_arrival",
  nextValue: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createPublicClient();
  if (!supabase) return { ok: true };

  try {
    const { error } = await supabase
      .from("products")
      .update({ [field]: nextValue })
      .eq("id", productId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidateStorefront();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update flag.",
    };
  }
}

export async function upsertAdminProductAction(
  input: UpsertProductInput,
): Promise<{ ok: boolean; product?: CatalogProduct; error?: string }> {
  const title = input.title.trim();
  const sku = input.sku.trim().toUpperCase();
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!title || !sku || !slug) {
    return { ok: false, error: "Title, SKU, and Slug are required." };
  }

  const payload = {
    category_id: input.category_id,
    sku,
    title,
    slug,
    tagline: input.tagline.trim() || "Precision-milled archival studio instrument.",
    description:
      input.description.trim() ||
      "Hand-assembled in our Warm Travertine Studio from solid anodized aluminum and Roman travertine.",
    price_usd: Math.max(0, Number(input.price_usd) || 250),
    compare_at_price_usd:
      input.compare_at_price_usd && Number(input.compare_at_price_usd) > 0
        ? Number(input.compare_at_price_usd)
        : null,
    stock_count: Math.max(0, Math.round(Number(input.stock_count) || 0)),
    is_featured: Boolean(input.is_featured),
    is_bestseller: Boolean(input.is_bestseller),
    is_new_arrival: Boolean(input.is_new_arrival),
    materials:
      input.materials.length > 0
        ? input.materials
        : ["Anodized aluminum", "Roman travertine"],
    dimensions: input.dimensions.trim() || "220 × 180 × 96 mm",
    weight: input.weight.trim() || "1.8 kg",
    images:
      input.images.length > 0
        ? input.images
        : ["/images/products/aether-01-headphones.png"],
  };

  const supabase = createPublicClient();
  if (!supabase) {
    const matchedCat = SEED_CATEGORIES.find((c) => c.id === payload.category_id);
    const fallbackProduct: CatalogProduct = {
      id: input.id ?? `sandbox-prod-${Date.now()}`,
      ...payload,
      rating: 4.92,
      review_count: 14,
      warranty_info: "5-year structural warranty · lifetime servicing",
      specs: {
        Chassis: "CNC AL-6061 / Travertine",
        Tolerance: "±0.01 mm",
        Origin: "Zurich / Copenhagen Studio",
      },
      three_d_config: {
        shape: "headphones",
        finish: "anodized-aluminum",
        metallic: 0.85,
        roughness: 0.3,
        base_hex: "#C9C6C0",
        accent_hex: "#C85632",
      },
      category_slug: matchedCat?.slug ?? "spatial-audio",
      variants: [
        {
          id: `sandbox-var-${Date.now()}`,
          product_id: input.id ?? "sandbox-prod",
          sku: `${sku}-STD`,
          variant_name: "Raw Anodized Silver",
          color_hex: "#C9C6C0",
          price_modifier_usd: 0,
          stock_count: payload.stock_count,
        },
      ],
    };
    return { ok: true, product: fallbackProduct };
  }

  try {
    let productRow: Row | null = null;

    if (input.id) {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", input.id)
        .select("*")
        .maybeSingle();

      if (error || !data) {
        return {
          ok: false,
          error: error?.message ?? "Failed to update product in Supabase.",
        };
      }
      productRow = data as Row;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...payload,
          rating: 4.92,
          review_count: 14,
          warranty_info: "5-year structural warranty · lifetime servicing",
          specs: {
            Chassis: "CNC AL-6061 / Travertine",
            Tolerance: "±0.01 mm",
            Origin: "Zurich / Copenhagen Studio",
          },
          three_d_config: {
            shape: "headphones",
            finish: "anodized-aluminum",
            metallic: 0.85,
            roughness: 0.3,
            base_hex: "#C9C6C0",
            accent_hex: "#C85632",
          },
        })
        .select("*")
        .single();

      if (error || !data) {
        return {
          ok: false,
          error: error?.message ?? "Failed to commission new product in Supabase.",
        };
      }
      productRow = data as Row;

      // Ensure at least one default variant exists for newly commissioned product
      await supabase.from("product_variants").insert({
        product_id: String(productRow.id),
        sku: `${sku}-STD`,
        variant_name: "Raw Anodized Silver",
        color_hex: "#C9C6C0",
        price_modifier_usd: 0,
        stock_count: payload.stock_count,
      });
    }

    const [{ data: catRow }, { data: varRows }] = await Promise.all([
      supabase
        .from("categories")
        .select("slug")
        .eq("id", String(productRow.category_id))
        .maybeSingle(),
      supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", String(productRow.id))
        .order("sku"),
    ]);

    const normalized = toProduct(productRow);
    const catalogProduct: CatalogProduct = {
      ...normalized,
      category_slug: ((catRow as Row | null)?.slug ?? "spatial-audio") as CategorySlug,
      variants: (varRows ?? []).map((r) => toVariant(r as Row)),
    };

    revalidateStorefront();
    revalidatePath(`/product/${catalogProduct.slug}`);

    return { ok: true, product: catalogProduct };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unexpected product save error.",
    };
  }
}

export async function deleteAdminProductAction(
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createPublicClient();
  if (!supabase) return { ok: true };

  try {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      return { ok: false, error: error.message };
    }
    revalidateStorefront();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete product.",
    };
  }
}

export async function updateAdminOrderStatusAction(
  orderId: string,
  nextStatus: OrderStatus,
): Promise<{ ok: boolean; status: OrderStatus; error?: string }> {
  const supabase = createPublicClient();
  if (!supabase) return { ok: true, status: nextStatus };

  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId)
      .select("status, order_number")
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        status: nextStatus,
        error: error?.message ?? "Failed to update order status.",
      };
    }

    const row = data as Row;
    revalidatePath("/admin");
    revalidatePath(`/order/${orderId}`);
    if (row.order_number) revalidatePath(`/order/${String(row.order_number)}`);
    revalidatePath("/account");

    return {
      ok: true,
      status: (row.status as OrderStatus) ?? nextStatus,
    };
  } catch (err) {
    return {
      ok: false,
      status: nextStatus,
      error: err instanceof Error ? err.message : "Failed to update order status.",
    };
  }
}

export async function createAdminDiscountCodeAction(input: {
  code: string;
  discountPercent: number;
  minOrderUsd: number;
  description: string;
}): Promise<{ ok: boolean; discount?: DiscountCode; error?: string }> {
  const code = input.code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
  const discountPercent = Math.min(90, Math.max(1, Math.round(Number(input.discountPercent) || 10)));
  const minOrderUsd = Math.max(0, Number(input.minOrderUsd) || 0);
  const description =
    input.description.trim() ||
    `${discountPercent}% off collector orders${minOrderUsd > 0 ? ` over $${minOrderUsd}` : ""}`;

  if (code.length < 3) {
    return { ok: false, error: "Privilege code must be at least 3 characters." };
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return {
      ok: true,
      discount: {
        id: `sandbox-code-${Date.now()}`,
        code,
        discount_percent: discountPercent,
        min_order_usd: minOrderUsd,
        description,
        is_active: true,
        expires_at: null,
      },
    };
  }

  try {
    const { data, error } = await supabase
      .from("discount_codes")
      .upsert(
        {
          code,
          discount_percent: discountPercent,
          min_order_usd: minOrderUsd,
          description,
          is_active: true,
        },
        { onConflict: "code" },
      )
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "Failed to issue privilege code.",
      };
    }

    revalidatePath("/admin");
    return {
      ok: true,
      discount: toDiscount(data as Row),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to issue privilege code.",
    };
  }
}

export async function toggleAdminDiscountActiveAction(
  discountId: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createPublicClient();
  if (!supabase) return { ok: true };

  try {
    const { error } = await supabase
      .from("discount_codes")
      .update({ is_active: isActive })
      .eq("id", discountId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to toggle code status.",
    };
  }
}

export async function deleteAdminDiscountCodeAction(
  discountId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createPublicClient();
  if (!supabase) return { ok: true };

  try {
    const { error } = await supabase
      .from("discount_codes")
      .delete()
      .eq("id", discountId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete code.",
    };
  }
}
