import { HeroSection } from "@/components/storefront/HeroSection";
import { SpecTickerStrip } from "@/components/storefront/SpecTickerStrip";
import { BentoCategoryGrid } from "@/components/storefront/BentoCategoryGrid";
import { BestsellerCarousel } from "@/components/storefront/BestsellerCarousel";
import { MaterialStorySection } from "@/components/storefront/MaterialStorySection";
import { CatalogShowcase } from "@/components/catalog/CatalogShowcase";
import { ReviewsMarquee } from "@/components/storefront/ReviewsMarquee";
import { getCatalogOverview } from "@/lib/supabase/queries";
import { getReviewsFeed } from "@/lib/supabase/reviews";
import type { CatalogProduct } from "@/types/database";

const curationScore = (p: CatalogProduct) => (p.is_bestseller ? 2 : 0) + (p.is_featured ? 1 : 0);

export default async function Home() {
  const [overview, reviewsFeed] = await Promise.all([getCatalogOverview(), getReviewsFeed()]);

  const flagship =
    overview.products.find((p) => p.sku === "AE-SA-001") ??
    overview.products.find((p) => p.is_featured) ??
    overview.products[0];

  const bestsellers = [...overview.products]
    .sort((a, b) => curationScore(b) - curationScore(a) || b.rating - a.rating || b.review_count - a.review_count)
    .slice(0, 6);

  return (
    <>
      {/* 1. Day 4 — interactive WebGL hero stage */}
      <HeroSection flagship={flagship} />
      {/* 2. Architectural specification ticker */}
      <SpecTickerStrip />
      {/* 3. Day 5 — 3D asymmetric bento (live categories) */}
      <BentoCategoryGrid categories={overview.categories} />
      {/* 4. Day 5 — curated bestsellers velocity carousel (live products) */}
      <BestsellerCarousel products={bestsellers} />
      {/* 5. Day 5 — The Anatomy of Permanence */}
      <MaterialStorySection />
      {/* 6. Days 2–3 — full filterable archive + promo validator */}
      <CatalogShowcase overview={overview} />
      {/* 7. Day 5 — verified buyer reviews marquee (live reviews) */}
      <ReviewsMarquee feed={reviewsFeed} />
    </>
  );
}
