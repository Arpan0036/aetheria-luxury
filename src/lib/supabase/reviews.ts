/**
 * Verified buyer reviews feed for the social-proof marquee.
 * Live `reviews` ⨝ `products` from Supabase, with the typed seed fallback.
 */
import { cacheLife, cacheTag } from "next/cache";
import type { ConnectionMode, Review, ReviewWithProduct, ReviewsFeed } from "@/types/database";
import { createPublicClient } from "./server";
import { SEED_PRODUCTS, SEED_REVIEWS } from "./fallback-data";

const QUERY_TIMEOUT_MS = 4000;

type Row = Record<string, unknown>;

function summarise(reviews: ReviewWithProduct[], mode: ConnectionMode): ReviewsFeed {
  const n = reviews.length || 1;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / n;
  const verified = reviews.filter((r) => r.verified_purchase).length / n;
  return {
    mode,
    reviews,
    average_rating: Math.round(avg * 100) / 100,
    verified_ratio: Math.round(verified * 100) / 100,
  };
}

function fallbackFeed(): ReviewsFeed {
  const byId = new Map(SEED_PRODUCTS.map((p) => [p.id, p]));
  const reviews = SEED_REVIEWS.map((r) => ({
    ...r,
    product_title: byId.get(r.product_id)?.title ?? "AETHERIA Object",
    product_sku: byId.get(r.product_id)?.sku ?? "",
  })).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return summarise(reviews, "local-fallback");
}

export async function getReviewsFeed(): Promise<ReviewsFeed> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog", "reviews");

  const supabase = createPublicClient();
  if (!supabase) return fallbackFeed();

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, product:products(title, sku)")
      .order("created_at", { ascending: false })
      .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
    if (error || !data?.length) return fallbackFeed();

    const reviews: ReviewWithProduct[] = (data as (Row & { product: Row | null })[]).map((r) => ({
      id: String(r.id),
      product_id: String(r.product_id),
      author_name: String(r.author_name),
      author_city: String(r.author_city ?? ""),
      rating: Number(r.rating ?? 5) as Review["rating"],
      title: String(r.title ?? ""),
      comment: String(r.comment ?? ""),
      verified_purchase: Boolean(r.verified_purchase),
      created_at: String(r.created_at),
      product_title: String(r.product?.title ?? "AETHERIA Object"),
      product_sku: String(r.product?.sku ?? ""),
    }));
    return summarise(reviews, "supabase-live");
  } catch {
    return fallbackFeed();
  }
}
