"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageSquarePlus, ShieldCheck, Star, X } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { submitProductReviewAction } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";
import type { ProductDetail, Review } from "@/types/database";

function formatReviewDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "ARCHIVE RECORD";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return "ARCHIVE RECORD";
  }
}

export function ProductReviewsSection({
  product,
  reviews,
  onReviewSubmitted,
}: {
  product: ProductDetail;
  reviews: Review[];
  onReviewSubmitted: (review: Review) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [authorName, setAuthorName] = useState("");
  const [authorCity, setAuthorCity] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalCount = reviews.length;
  const averageScore =
    totalCount > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount
      : product.rating;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : stars === 5 ? 100 : 0;
    return { stars, count, pct };
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await submitProductReviewAction({
        productId: product.id,
        productSlug: product.slug,
        rating,
        authorName,
        authorCity: authorCity.trim() || "Zurich, CH",
        title,
        comment,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }

      onReviewSubmitted(res.review);
      setAuthorName("");
      setAuthorCity("");
      setTitle("");
      setComment("");
      setRating(5);
      setSuccessMsg(
        res.mode === "supabase-live"
          ? "Field Report recorded in live Supabase PostgreSQL."
          : "Field Report recorded in local archive.",
      );
      setFormOpen(false);
    });
  };

  return (
    <section
      id="collector-reviews"
      aria-label="Verified Collector Field Reports"
      className="mt-20 scroll-mt-28 border-t border-line pt-16 md:mt-24 md:pt-20"
    >
      {/* Top Section Header + Submit Field Report CTA */}
      <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
            § 02 — VERIFIED COLLECTOR FIELD REPORTS // LIVE SUPABASE REVIEWS
          </p>
          <h2 className="font-display text-[40px] leading-[1.02] text-ink sm:text-[56px]">
            Collector <em className="text-accent">Field Reports.</em>
          </h2>
        </div>

        <MagneticButton
          size="md"
          variant={formOpen ? "surface" : "primary"}
          onClick={() => {
            setFormOpen((v) => !v);
            setErrorMsg(null);
          }}
        >
          {formOpen ? (
            <>
              <X className="size-4" strokeWidth={1.75} /> Close Field Report Form
            </>
          ) : (
            <>
              <MessageSquarePlus className="size-4" strokeWidth={1.75} /> Submit a Field Report (Write Review)
            </>
          )}
        </MagneticButton>
      </div>

      {/* Confirmation Banner after Live Insert */}
      {successMsg && (
        <div
          role="status"
          className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-sage/45 bg-sage/10 px-5 py-3.5 font-mono text-[11px] tracking-[0.14em] text-sage"
        >
          <span className="inline-flex items-center gap-2">
            <Check className="size-4" strokeWidth={2.2} />
            {successMsg.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            aria-label="Dismiss confirmation"
            className="text-ink hover:text-accent"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Interactive "Submit a Field Report (Write Review)" Form Drawer */}
      <AnimatePresence initial={false}>
        {formOpen && (
          <motion.div
            key="review-form-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="mb-10 rounded-[26px] border border-line-strong bg-surface p-6 shadow-[0_24px_60px_-36px_rgb(var(--shadow-tint)/0.5)] md:p-8"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
                    LIVE POSTGRESQL INSERT // PUBLIC.REVIEWS
                  </p>
                  <h3 className="mt-1 font-display text-[30px] leading-none text-ink">
                    Log a Collector Field Report for {product.title}
                  </h3>
                </div>
                <span className="font-mono text-[10px] tracking-wider text-muted">
                  OBJECT REF: {product.sku}
                </span>
              </div>

              {/* 1–5 Star Rating Selector */}
              <div className="mb-5">
                <span className="mb-2 block font-mono text-[10px] tracking-[0.18em] text-muted">
                  01 // ACOUSTIC &amp; ARCHITECTURAL RATING ({rating} / 5 STARS)
                </span>
                <div className="flex items-center gap-2" role="radiogroup" aria-label="Select star rating">
                  {([1, 2, 3, 4, 5] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star} stars`}
                      onClick={() => setRating(star)}
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 font-mono text-[11px] transition-all",
                        rating >= star
                          ? "border-accent bg-accent/15 text-ink"
                          : "border-line bg-canvas text-muted",
                      )}
                    >
                      <Star
                        className={cn(
                          "size-3.5",
                          rating >= star ? "fill-accent text-accent" : "text-muted",
                        )}
                        strokeWidth={1.75}
                      />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Name + City/Country */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="review-author-name"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    02 // COLLECTOR NAME *
                  </label>
                  <input
                    id="review-author-name"
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g., Julian Vance"
                    className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="review-author-city"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                  >
                    03 // STUDIO CITY &amp; COUNTRY *
                  </label>
                  <input
                    id="review-author-city"
                    type="text"
                    required
                    value={authorCity}
                    onChange={(e) => setAuthorCity(e.target.value)}
                    placeholder="e.g., Zurich, CH"
                    className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                  />
                </div>
              </div>

              {/* Review Title */}
              <div className="mt-4">
                <label
                  htmlFor="review-title"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  04 // FIELD REPORT HEADLINE *
                </label>
                <input
                  id="review-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Monolithic machining and zero acoustic fatigue"
                  className="h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[14px] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              {/* Detailed Review */}
              <div className="mt-4">
                <label
                  htmlFor="review-comment"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
                >
                  05 // DETAILED EVALUATION *
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the material finish, tactile feedback, and placement in your workspace or listening room…"
                  className="w-full rounded-xl border border-line-strong bg-canvas p-4 text-[14px] leading-relaxed text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              {errorMsg && (
                <p role="alert" className="mt-3 font-mono text-[11px] text-accent">
                  {errorMsg}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted">
                  PUBLISHED DIRECTLY TO LIVE SUPABASE REVIEWS LEDGER
                </span>
                <MagneticButton
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={isPending}
                >
                  {isPending ? "Publishing to Supabase…" : "Publish Field Report →"}
                </MagneticButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aggregate Rating Breakdown + Verified Review Cards Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 4 Columns: Aggregate Rating Ledger */}
        <div className="lg:col-span-4">
          <div className="rounded-[24px] border border-line bg-surface p-6">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
                  AGGREGATE SCORE
                </p>
                <p className="mt-1 font-display text-[56px] leading-none text-ink">
                  {averageScore.toFixed(2)}{" "}
                  <span className="font-mono text-[16px] text-muted">/ 5.0</span>
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-accent text-accent"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="mt-1.5 font-mono text-[10.5px] tracking-wider text-muted">
                  {totalCount} {totalCount === 1 ? "REPORT" : "REPORTS"}
                </p>
              </div>
            </div>

            {/* 5-Star Distribution Bars */}
            <ul className="my-5 space-y-2.5 font-mono text-[10.5px]">
              {distribution.map((row) => (
                <li key={row.stars} className="flex items-center gap-3">
                  <span className="w-10 text-ink">{row.stars} ★</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                    <div
                      style={{ width: `${row.pct}%` }}
                      className="h-full rounded-full bg-accent transition-all duration-500"
                    />
                  </div>
                  <span className="tabular w-9 text-right text-muted">{row.pct}%</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 rounded-xl border border-sage/35 bg-canvas px-3.5 py-2.5 font-mono text-[10px] tracking-[0.14em] text-sage">
              <ShieldCheck className="size-4 shrink-0" strokeWidth={1.75} />
              <span>100% VERIFIED COLLECTOR HARDWARE</span>
            </div>
          </div>
        </div>

        {/* Right 8 Columns: Verified Review Cards Grid */}
        <div className="lg:col-span-8">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id}>
                <article className="flex h-full flex-col justify-between rounded-[22px] border border-line bg-surface p-6 transition-colors hover:border-line-strong">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-0.5"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3.5",
                              i < review.rating
                                ? "fill-accent text-accent"
                                : "text-line-strong",
                            )}
                            strokeWidth={1.5}
                          />
                        ))}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-sage/35 bg-sage/10 px-2.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-sage">
                        <Check className="size-2.5" strokeWidth={2.5} />
                        VERIFIED COLLECTOR
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-[26px] leading-[1.08] text-ink">
                      {review.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                      “{review.comment}”
                    </p>
                  </div>

                  <footer className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
                    <div>
                      <p className="text-[13.5px] font-medium text-ink">
                        {review.author_name}
                      </p>
                      <p className="mt-0.5 font-mono text-[9.5px] tracking-[0.14em] text-muted">
                        {formatReviewDate(review.created_at)}
                      </p>
                    </div>
                    <span className="rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] text-ink">
                      {(review.author_city || "ZURICH, CH").toUpperCase()}
                    </span>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
