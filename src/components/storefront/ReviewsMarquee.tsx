import { Check, Star } from "lucide-react";
import type { ReviewWithProduct, ReviewsFeed } from "@/types/database";

function ReviewCard({ review }: { review: ReviewWithProduct }) {
  return (
    <li className="w-[300px] shrink-0 px-2.5 [perspective:1200px] sm:w-[380px]">
      <article className="flex h-full flex-col rounded-[22px] border border-line bg-surface p-6 shadow-[0_24px_50px_-40px_rgb(var(--shadow-tint)/0.5)] transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-editorial)] [transform-origin:50%_100%] hover:border-line-strong hover:shadow-[0_40px_70px_-40px_rgb(var(--shadow-tint)/0.6)] hover:[transform:translateY(-6px)_rotateX(4deg)]">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                aria-hidden
                strokeWidth={1.5}
                className={i < review.rating ? "size-3.5 fill-accent text-accent" : "size-3.5 text-line-strong"}
              />
            ))}
          </span>
          {review.verified_purchase && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#2F6B45]/35 bg-[#2F6B45]/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-[#2F6B45] espresso:border-[#9CCBA6]/35 espresso:bg-[#9CCBA6]/10 espresso:text-[#9CCBA6]">
              <Check className="size-2.5" strokeWidth={2.5} /> VERIFIED OWNER
            </span>
          )}
        </div>
        <h3 className="mt-4 font-display text-[26px] leading-[1.08] text-ink">{review.title}</h3>
        <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">“{review.comment}”</p>
        <footer className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-ink">{review.author_name}</p>
            <p className="mt-0.5 truncate font-mono text-[9.5px] tracking-[0.12em] text-muted">
              {review.product_title.toUpperCase()}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-line-strong px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] text-ink">
            {review.author_city.toUpperCase()}
          </span>
        </footer>
      </article>
    </li>
  );
}

function MarqueeRow({ reviews, direction, duration }: { reviews: ReviewWithProduct[]; direction: "left" | "right"; duration: number }) {
  return (
    <div className="marquee py-4">
      <div className="marquee-track" data-direction={direction} style={{ ["--marquee-duration" as string]: `${duration}s` }}>
        <ul className="flex">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
        <ul className="flex" aria-hidden>
          {reviews.map((r) => (
            <ReviewCard key={`dup-${r.id}`} review={r} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ReviewsMarquee({ feed }: { feed: ReviewsFeed }) {
  const half = Math.ceil(feed.reviews.length / 2);
  const rowA = feed.reviews.slice(0, half);
  const rowB = feed.reviews.slice(half);
  const verifiedPct = Math.round(feed.verified_ratio * 100);

  return (
    <section id="reviews" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 md:px-8">
        <header className="mb-8 border-t border-line pt-6 md:mb-10">
          <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
            § 05 — VERIFIED TIER-1 COLLECTORS // LIVE SUPABASE REVIEWS
          </p>
          <h2 className="max-w-[18ch] font-display text-[44px] text-ink sm:text-[60px] lg:text-[74px]">
            Field reports from <em className="text-accent">studio &amp; sanctuary.</em>
          </h2>
        </header>

        <ul className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-surface px-4 py-3 font-mono text-[10.5px] tracking-[0.15em] text-ink md:px-6">
          <li className="tabular">{feed.average_rating.toFixed(2)} ★ AVERAGE RATING</li>
          <li aria-hidden className="text-muted">•</li>
          <li>{verifiedPct}% VERIFIED COLLECTORS</li>
          <li aria-hidden className="text-muted">•</li>
          <li>DISPATCHED TO NY, LONDON, ZURICH &amp; TOKYO</li>
          <li className="ml-auto hidden text-muted md:block">
            {String(feed.reviews.length).padStart(2, "0")} FIELD REPORTS ·{" "}
            {feed.mode === "supabase-live" ? "LIVE POSTGRESQL" : "SEED FALLBACK"}
          </li>
        </ul>
      </div>

      <MarqueeRow reviews={rowA} direction="left" duration={70} />
      <MarqueeRow reviews={rowB} direction="right" duration={78} />
    </section>
  );
}
