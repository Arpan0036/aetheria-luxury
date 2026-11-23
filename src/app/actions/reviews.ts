"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { ConnectionMode, Review } from "@/types/database";

export interface SubmitReviewInput {
  productId: string;
  productSlug: string;
  rating: number;
  authorName: string;
  authorCity: string;
  title: string;
  comment: string;
}

export type SubmitReviewResult =
  | {
      ok: true;
      review: Review;
      mode: ConnectionMode;
    }
  | {
      ok: false;
      error: string;
    };

export async function submitProductReviewAction(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  const authorName = input.authorName.trim().slice(0, 80);
  const authorCity = (input.authorCity.trim() || "Zurich, CH").slice(0, 60);
  const title = input.title.trim().slice(0, 140);
  const comment = input.comment.trim().slice(0, 2000);
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5))) as Review["rating"];

  if (authorName.length < 2) {
    return { ok: false, error: "Please enter your name (at least 2 characters)." };
  }
  if (title.length < 2) {
    return { ok: false, error: "Please enter a brief headline for your field report." };
  }
  if (comment.length < 5) {
    return { ok: false, error: "Please share at least a sentence on your experience with the object." };
  }

  const supabase = createPublicClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: input.productId,
          author_name: authorName,
          author_city: authorCity,
          rating,
          title,
          comment,
          verified_purchase: true,
        })
        .select("*")
        .single();

      if (!error && data) {
        const row = data as Record<string, unknown>;
        const created: Review = {
          id: String(row.id),
          product_id: String(row.product_id),
          author_name: String(row.author_name),
          author_city: String(row.author_city ?? ""),
          rating: Number(row.rating ?? 5) as Review["rating"],
          title: String(row.title ?? ""),
          comment: String(row.comment ?? ""),
          verified_purchase: Boolean(row.verified_purchase),
          created_at: String(row.created_at),
        };

        revalidateTag("catalog", "max");
        revalidateTag("reviews", "max");
        revalidateTag(`product:${input.productSlug}`, "max");
        revalidatePath(`/product/${input.productSlug}`);
        revalidatePath("/");

        return {
          ok: true,
          review: created,
          mode: "supabase-live",
        };
      }
    } catch {
      /* fall through to resilient local fallback */
    }
  }

  const fallbackReview: Review = {
    id: `local-${Date.now()}`,
    product_id: input.productId,
    author_name: authorName,
    author_city: authorCity,
    rating,
    title,
    comment,
    verified_purchase: true,
    created_at: new Date().toISOString(),
  };

  return {
    ok: true,
    review: fallbackReview,
    mode: "local-fallback",
  };
}
