# AETHERIA — PRD Progress Tracker

> 3D Full-Stack Luxury E-Commerce · 14-phase build · **Warm Editorial Luxury** design language

| Phase | Scope | Status |
| --- | --- | --- |
| **Day 1** | Foundation, design system, 3D motion primitives, global shell | ✅ Complete & Verified |
| **Day 2** | Supabase PostgreSQL schema, RLS policies, 12-product luxury seed data & resilient dual-mode data layer | ✅ Complete & Verified |
| **Day 3** | Live Supabase (`aetheria-luxury`) data audit, AI Studio product & category photography (`public/images/`), storefront `<Image>` integration | ✅ Complete & Verified |
| **Day 4** | Centerpiece 3D WebGL Motion Graphics Hero Stage (`AETHER-CORE 01`), Exploded-View Choreography, PBR Finish Switcher & Spatial `<Html>` Hotspots | ✅ Complete & Verified |
| **Day 5** | 3D Asymmetric Bento Category Grid, "Anatomy of Permanence" scroll-driven 3D layer storytelling, Bestsellers velocity carousel & live Supabase reviews marquee | ✅ Complete & Verified |
| **Day 6** | Dedicated `/shop` Archive Page, URL-Synced Multi-Facet Filter Engine, 3D Layout Density Switcher, 3D Quick-Inspect Modal & Global `Cmd + K` Spotlight Search | ✅ Complete & Verified |
| **Day 7** | `/product/[slug]` Split-Screen 3D & Studio Gallery PDP, 2.2× Optical Loupe, Category-Adaptive 3D WebGL Inspector, Variant State Machine, Live Review Submission & Sticky Conversion Bar | ✅ Complete & Verified |
| **Day 8** | Spatial 3D Slide-Out Cart Drawer, Persistent Wishlist Engine (`aetheria-cart-v1` & `aetheria-wishlist-v1`), Free-Shipping Progress Bar & Live Supabase Promo Code Validator | ✅ Complete & Verified |
| **Day 9** | `/checkout` Private Concierge Checkout, 3D Metallic Payment Card Stage (`PaymentCard3D.tsx`), Live Supabase Order Creation (`/api/checkout`), `/order/[id]` 4-Stage Telemetry Tracker & Printable Tax Invoice | ✅ Complete & Verified |
| **Day 10** | `/account` Collector Auth Portal, 3D Titanium Membership Pass (`CollectorPass3D.tsx`), Live Supabase Profile & Order Vault, Hardware Warranty Certificates & 1-Click Admin Role Switcher | ✅ Complete & Verified |
| **Day 11** | `/admin` No-Code Merchant Studio, Executive Telemetry, Product CRUD + Supabase Storage (`product-images`) Image Uploader, Live Order Board & Promo Manager | ✅ Complete & Verified |
| **Day 12** | Tier-1 Technical SEO, JSON-LD Rich Snippets (`Organization`, `WebSite`, `Product`, `BreadcrumbList`), Dynamic `/sitemap.xml` & `/robots.txt`, 5 Brand/Legal Pages (`/about`, `/contact`, `/shipping-returns`, `/privacy`, `/terms`), Live Supabase Concierge & Newsletter DB & 4-Device Audit | ✅ Complete & Verified |
| **Day 13** | Production Build (`npm run build`) Zero-Error Audit, Live Supabase Data Hygiene, Production Server (`npm run start`) 4-Device E2E Verification & Gumroad/Reels Commercial Sales Kit (`/marketing-kit/`) | ✅ Complete & Verified |
| **Day 14** | Detached Commercial Release Export (`exports/aetheria-3d-ecommerce-boilerplate/`), Complete Personal-Key Scrubbing, Consolidated 1-Click Supabase SQL (`001_complete_schema.sql` & `seed.sql`), `AGENTS.md` AI Playbook, Clean-Room Zero-Env Build & Commercial ZIP (`aetheria-3d-ecommerce-boilerplate-v1.0.zip`) | ✅ Complete & Verified |

---

## Day 1 — Foundation & Global Shell

### 1. Project & packages
- [x] Next.js 16 (App Router, TypeScript, Tailwind CSS v4, `src/` dir, `@/*` alias)
- [x] Motion: `framer-motion`, `gsap`, `lenis`
- [x] 3D (pre-installed): `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`
- [x] Utilities: `lucide-react`, `clsx`, `tailwind-merge`, `zustand`

### 2. Design system (`src/app/globals.css`)
- [x] Warm Daylight (default) + Velvet Espresso token sets via `html[data-theme]`
- [x] Tailwind v4 `@theme inline` mapping → `bg-canvas`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, `text-sage`, `glass`…
- [x] `daylight:` / `espresso:` custom variants
- [x] Fonts via `next/font/google`: Instrument Serif (display, −0.03em / 1.05), Plus Jakarta Sans (UI), JetBrains Mono (tabular-nums)
- [x] Pre-paint inline theme script (no flash, no hydration mismatch) + localStorage persistence
- [x] Paper-grain overlay, glass utility, reduced-motion fallbacks

### 3. Components
- [x] `src/store/useUIStore.ts` — theme, mobile menu, search, currency (USD/GBP/EUR), demo cart count + pulse
- [x] `src/components/motion/SmoothScrollProvider.tsx` — Lenis inertial scroll, `scrollToTarget()`, Cmd/Ctrl+K listener, scroll lock while overlays open
- [x] `src/components/motion/MagneticButton.tsx` — 40px magnetic field, spring 150/15, 3D press, `primary` / `surface` / `outline`
- [x] `src/components/motion/Tilt3DCard.tsx` — perspective 1000px, ±10° tilt, moving specular glare, `translateZ(24px)` content, auto-disabled on touch
- [x] `src/components/storefront/Navbar.tsx` — utility ticker, currency + theme switchers, floating glass header, animated underline nav, wordmark, ⌘K pill, wishlist, animated `Bag [02]` pill
- [x] `src/components/storefront/MobileDrawer.tsx` — modal `<dialog>` drawer, native swipe-to-dismiss (scroll-snap), staggered reveals, currency/theme, support links
- [x] `src/components/storefront/SearchPalette.tsx` — ⌘K command palette (native dialog)
- [x] `src/components/storefront/Footer.tsx` — VIP newsletter w/ mono validation badge, 4-col sitemap, architecture info, live local clock, back-to-top, oversized watermark

---

## Day 2 — Supabase Architecture, PostgreSQL Schema, RLS & Resilient Data Layer

### 1. Packages & Environment
- [x] Installed `@supabase/supabase-js` & `@supabase/ssr`
- [x] Created `.env.example` & configured `.env.local` for live project `aetheria-luxury` (`https://fvltazfudjmhagpdwouw.supabase.co`)

### 2. PostgreSQL Schema & Row Level Security (`supabase/migrations/001_initial_schema.sql`)
- [x] 8 tables with UUID primary keys & `created_at`/`updated_at` triggers: `categories`, `products`, `product_variants`, `reviews`, `discount_codes`, `profiles`, `orders`, `order_items`
- [x] RLS enabled on all 8 tables with public `SELECT` policies on catalog/active discounts, owner-scoped `profiles`/`orders`/`order_items` policies using `(select auth.uid())`, and admin CRUD via `private.is_admin()`
- [x] Performance & foreign-key indexes on `products(slug)`, `products(category_id)`, `products(is_featured)`, `orders(user_id)`, `product_variants(product_id)`, `reviews(product_id)`, and `order_items` FKs

### 3. Luxury Seed Data (`supabase/seed.sql` & `src/lib/supabase/fallback-data.ts`)
- [x] 4 Architectural Categories: `spatial-audio` (3), `desk-architecture` (4), `tactile-computing` (3), `ambient-lighting` (2)
- [x] 12 Seeded Luxury Products (`AETHER-01` through `LUMINA-ARC`) with SKUs, specs, dimensions, materials, and `three_d_config`
- [x] 27 Product Variants with hex swatches & price modifiers, 16 Verified Buyer Reviews across global cities, and 3 Promo Codes (`AETHERIA15`, `TIER1VIP`, `FREESHIP`)

---

## Day 3 — Live Supabase (`aetheria-luxury`) Data Audit, AI Studio Product Photography & Storefront Image Integration

### 1. Live Supabase (`aetheria-luxury`) Verification & SQL Media Update
- [x] Audited `.env.local` credentials (`https://fvltazfudjmhagpdwouw.supabase.co`) and confirmed live table row counts (`4` categories, `12` products, `27` variants, `16` reviews, `3` discount codes)
- [x] Executed live SQL `UPDATE` statements on `public.categories` (`image_url`) and `public.products` (`images` array) and verified via `SELECT title, slug, images FROM public.products`
- [x] Synchronized `src/lib/supabase/fallback-data.ts` and regenerated `supabase/seed.sql` (`npm run db:seed:generate`)

### 2. Warm Travertine Studio Photography (`public/images/`)
- [x] Generated 12 luxury product studio photos in `public/images/products/` & 4 wide-format (`16:9`) editorial category banners in `public/images/categories/`
- [x] Added 4-column interactive **Category Visual Banner Strip** and upgraded `ProductCatalogCard` to Next.js `<Image>` inside `aspect-[4/5]` warm travertine containers

---

## Day 4 — Centerpiece 3D WebGL Motion Graphics Hero Stage, Exploded-View Choreography & Spatial Hotspots

### 1. Procedural 3D Architectural Sculpture (`src/components/canvas/AcousticMonolithMesh.tsx`)
- [x] Self-contained 5-part procedural 3D sculpture (`AETHER-CORE 01`) with zero external `.glb`/HDR dependencies:
  1. Honed Roman Travertine Pedestal Base (`#E5E0D8`, procedural sedimentary stone canvas texture, `roughness: 0.85`)
  2. Outer CNC Anodized Acoustic Gimbal Ring & Yoke (real-time finish-reactive PBR shader)
  3. Frosted Borosilicate Glass Halo Chamber (`meshPhysicalMaterial` with `transmission: 0.92`, `ior: 1.45`, `thickness: 1.2`, `roughness: 0.15`)
  4. Internal Beryllium Acoustic Core & Terracotta Driver Coil (`#C85632` breathing emissive core + 14 counter-rotating acoustic fins)
  5. Orbital Calibration Rings (cursor-reactive tilt + wireframe ring)
- [x] Smooth cursor parallax & camera damping (`THREE.MathUtils.damp`), `@react-three/drei` `<Float>` levitation, and exploded-view spring physics along Y/Z axes
- [x] 3 floating glassmorphic `<Html center distanceFactor={8}>` spatial callout badges (`[ 01 // 50MM BERYLLIUM TRANSDUCER ]`, `[ 02 // BOROSILICATE ACOUSTIC CHAMBER ]`, `[ 03 // CNC AL-6061 / TRAVERTINE BASE ]`)

### 2. WebGL Stage & Theme-Reactive Studio Lighting (`src/components/canvas/Hero3DStage.tsx`)
- [x] `<Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.5, 5.2], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>`
- [x] Theme-reactive lighting synced with `useUIStore.theme` (Warm Daylight 4800K key/fill + soft `<ContactShadows />` vs. Velvet Espresso warm amber rim & point lights) + procedural `<Environment>` lightformers
- [x] Viewport `IntersectionObserver` pause optimization (`frameloop={inView ? "always" : "never"}`)

### 3. Architectural Hero Section & Live Supabase Flagship CTA (`src/components/storefront/HeroSection.tsx`)
- [x] Full-viewport (`min-h-[92vh]`) responsive split/layered spatial stage (stacked cleanly on mobile/tablet `< 1024px` with zero text overlap; 12-column split on desktop)
- [x] `SERIES 01 // SPATIAL ACOUSTIC ARCHITECTURE [WEBGL 2.0 LIVE]` telemetry header, *"Sculpted Sound. Monolithic Form."* display headline, and interactive 3D Control Deck:
  - `01 / Raw Anodized Silver` (`#D8D6D0`, metallic `0.9`, roughness `0.22`)
  - `02 / Obsidian Matte` (`#1F1E1D`, metallic `0.6`, roughness `0.45`)
  - `03 / Brushed Architectural Brass` (`#C5A059`, metallic `0.88`, roughness `0.25`)
  - `[ EXPLODE ARCHITECTURE ]` toggle button + scroll-choreographed trigger
- [x] Primary Conversion Bar wired to live `aetheria-luxury` Supabase record for **AETHER-01 Spatial Reference Headphones** (`$540` base price, live currency conversion, and Navbar Bag counter increment)

### 4. Day 4 Verification Log
- **TypeScript & ESLint**: `tsc --noEmit` & `eslint src` — 0 errors, 0 warnings.
- **WebGL 2.0 & Hydration Check**: 0 hydration errors, 0 Next.js DevTools issues (`step_105_shot_1.png`).
- **Desktop (`1440px x 900px`)**:
  - 5-part procedural 3D sculpture (`AETHER-CORE 01`) rendered cleanly inside `[data-testid="hero-3d-stage"]`.
  - Real-time PBR Finish Switcher verified across `01 / Raw Anodized Silver` (`#D8D6D0`), `02 / Obsidian Matte` (`#1F1E1D`), and `03 / Brushed Architectural Brass` (`#C5A059`).
  - Clicking `[ EXPLODE ARCHITECTURE ]` separates all 5 sub-meshes along Y/Z axes and reveals all 3 camera-projected spatial callouts (`[ 01 // 50MM BERYLLIUM TRANSDUCER ]`, `[ 02 // BOROSILICATE ACOUSTIC CHAMBER ]`, `[ 03 // CNC AL-6061 / TRAVERTINE BASE ]`) with zero clipping (`step_103_shot_1.png`).
  - Theme switching between **Warm Daylight** (`LIGHTING: WARM DAYLIGHT 4800K`) and **Velvet Espresso** (`LIGHTING: VELVET ESPRESSO RIM`) updates both page tokens and 3D studio lighting (`step_20.png`).
  - Flagship Quick-Buy CTA (`Add Flagship to Bag — $540.00`) increments Navbar Bag counter (`Bag [02]` → `Bag [03]`).
- **Laptop (`1280px x 800px`), Tablet (`768px x 1024px`), & Mobile (`375px x 812px`)**:
  - Verified clean top-stacked 3D stage on Tablet (`498px` height, `73.5px` vertical gap above `<h1>`) and Mobile (`418px` height, `88.4px` vertical gap above `<h1>`) with zero text overlap and zero horizontal overflow across all 4 viewports.


---

## Day 5 — 3D Bento Categories, Material Storytelling, Velocity Carousel & Live Reviews

### 1. Live Supabase (`aetheria-luxury`) data
- [x] Audited live `reviews`: 16 verified rows (≥ 8), so no insert was needed. Cities include New York, London, Zurich, Sydney, Tokyo and others
- [x] New `src/lib/supabase/reviews.ts`: `getReviewsFeed()` runs `reviews ⨝ products(title, sku)` live, computes average rating and verified ratio, and falls back to typed seed data
- [x] `ReviewWithProduct` / `ReviewsFeed` types added to `src/types/database.ts`
- [x] Shared `catalogCategory` filter in `useUIStore` (Bento grid → archive filter)

### 2. Components
- [x] `BentoCategoryGrid.tsx`: 12-col asymmetric 7/5 · 5/7 grid (2-col tablet, 1-col mobile), `perspective: 1200px` cursor tilt, specular glare + sweep, Z-layered photo (0px) / badge (25px) / caption (35px). Click sets the filter and smooth-scrolls to `#objects`
- [x] `BestsellerCarousel.tsx`: top 6 bestseller/featured products, `useScroll` → `useVelocity` → spring → `rotateY ±6°`, mouse drag-to-scroll, snap, Magnetic prev/next, variant dots with live label, currency-reactive price, Add to Bag with `+1 BAG` micro-animation, progress rail
- [x] `MaterialStorySection.tsx`: 5/7 split with a sticky 3D Layer Inspector, 3 chapters (CNC AL-6061, Roman Travertine, Beryllium & Optics). On desktop chapters activate on scroll (IntersectionObserver); on every viewport they activate on click. Isometric plate stack `rotateX(14) rotateY(-18) rotateZ(4)` with spring Z-elevation, crosshair overlays, coordinate HUD, scroll-linked grid and stack parallax, and pointer parallax
- [x] `ReviewsMarquee.tsx`: live trust ledger, two marquee rows moving in opposite directions that pause on hover/focus, cards lift `translateY(-6px) rotateX(4deg)`, plus stars, city badge, ✓ VERIFIED OWNER pill and product name
- [x] `SpecTickerStrip.tsx`: monospace architectural spec marquee
- [x] `useFinePointer` hook (`useSyncExternalStore`) turns off cursor-driven 3D on touch devices and with reduced motion

### 3. Home page flow (`src/app/page.tsx`)
Hero (Day 4) → Spec Ticker → § 01 Bento → § 02 Bestsellers → § 03 Anatomy → § 04 Archive (Days 2–3; the duplicate banner strip was removed because the Bento grid replaces it) → § 05 Reviews. The Navbar/drawer "Editorial" link now points to `#anatomy`.

### 4. Verification
- [x] `tsc --noEmit` and `eslint src`: 0 errors
- [x] Headless Chrome at 1440 / 1280 / 768 / 375


---

## Day 6 — Dedicated `/shop` Archive Page, Multi-Facet Filter Engine, 3D Quick-Inspect Modal & `Cmd + K` Spotlight Search

### 1. Dedicated `/shop` Archive Page (`src/app/shop/page.tsx` & `src/components/storefront/ShopArchiveClient.tsx`)
- [x] Server route at `/shop` querying `getCatalogOverview()` from live `aetheria-luxury` Supabase PostgreSQL wrapped in a `<Suspense>` boundary
- [x] Editorial Archive Header with live breadcrumb & telemetry strip (`HOME // OBJECT ARCHIVE // [LIVE SUPABASE CATALOG: 12 OBJECTS]`), dynamic `Instrument Serif` headline & category description, and Spotlight trigger pill
- [x] Real-time 3D Layout Density Switcher with `Framer Motion` `layoutId` transitions across:
  1. `[ 3-COL SPATIAL GRID ]` (default 3D `Tilt3DCard` catalog)
  2. `[ 2-COL EDITORIAL GALLERY ]` (oversized `16:11` studio photography + full description + material tags)
  3. `[ TECHNICAL LEDGER VIEW ]` (horizontal engineering rows with thumbnail, SKU, stock count, material tags, finish swatches, Quick Inspect & 1-click Add to Bag)

### 2. URL-Synced Multi-Facet Filter Engine (`src/components/storefront/ShopFilterSidebar.tsx` & `src/lib/catalog-query.ts`)
- [x] Zero-latency multi-facet filtering synced with Next.js URL query parameters (`?category=...&minPrice=...&maxPrice=...&material=...&inStock=...&bestseller=...&featured=...&newArrival=...&sort=...&q=...`)
- [x] 5 filter facets:
  1. Architectural Category (`All Objects`, `Spatial Audio`, `Desk Architecture`, `Tactile Computing`, `Ambient Lighting`) with live `JetBrains Mono` object counts
  2. Valuation Ceiling range slider (`$150`–`$1,000`) + quick-select price tiers (`Under $250`, `$250 – $450`, `$450+`) with live currency conversion
  3. Materials & Surface Finishes swatch pills (`Anodized Aluminum`, `Roman Travertine`, `Brushed Brass`, `Obsidian Matte`, `Borosilicate Glass`, `Titanium`, `Saddle Leather`)
  4. Archive Status switches (`In Stock Only`, `Bestsellers`, `Featured Objects`, `New Arrivals`)
  5. Sort Choreography (`Curated Featured`, `Price: Low to High`, `Price: High to Low`, `Top Collector Rating`, `SKU Reference`)
- [x] Active filter chips bar (`[ CATEGORY: ... × ]`, `[ PRICE: ... × ]`, `[ MATERIAL: ... × ]`) + `"Clear All Filters"` button + Empty State Recovery card with 1-click reset & 3 recommended flagship objects
- [x] Mobile & Tablet (`< 1024px`) floating glassmorphic bottom pill (`[ FILTER & SORT ARCHIVE • 12 ]`) opening a 3D slide-up bottom sheet drawer with `"Apply Filters"` CTA

### 3. 3D Quick-Inspect Modal (`src/components/storefront/QuickInspectModal.tsx`)
- [x] Added `"Quick Inspect [+]"` button on every product card in `/shop` and Home Page (`CatalogShowcase.tsx`)
- [x] Glassmorphic spatial modal with 3D background scale-back (`scale(0.97)` on `<main>`), left `Tilt3DCard` studio photo + `IN STOCK` / `SKU` / `RATING` badges, and right panel with `Instrument Serif` title, live currency price, interactive `product_variants` selector (updating SKU, stock, and price modifier), 4-cell `JetBrains Mono` specs grid (`DIMENSIONS`, `WEIGHT`, `PRIMARY MATERIALS`, `WARRANTY`), quantity adjuster (`- / +`), `"Add to Bag"` `MagneticButton`, and `"View Full 3D Product Showcase →"` link (`/product/[slug]`)

### 4. Global `Cmd/Ctrl + K` Spotlight Search Engine (`src/components/storefront/SpotlightSearchModal.tsx`)
- [x] Wired to `isSearchOpen` in `useUIStore`, global `Cmd/Ctrl + K` / `Escape` keyboard shortcuts, and `Navbar` search triggers
- [x] Live instant search across `title`, `sku`, `tagline`, `description`, `materials`, and `category` against live Supabase products passed from `RootLayout`
- [x] Empty-query Discovery State with 4 Quick Department Shortcuts, 4 Trending Archive Queries (`"Travertine"`, `"Headphones"`, `"Mechanical Keyboard"`, `"Brass Lamp"`), and Top 3 Flagship Objects
- [x] Keyboard arrow navigation (`↑` / `↓` / `Enter`) and 1-click `"Add to Bag +"` & `"Inspect"` actions on every search result


---

## Day 7 — `/product/[slug]` Split-Screen 3D & Studio Gallery PDP, Variant State Machine, Live Review Submission & Sticky Conversion Bar

### 1. Split-Screen Architectural PDP (`src/app/product/[slug]/page.tsx` & `src/components/storefront/ProductDetailClient.tsx`)
- [x] Server route at `/product/[slug]` querying `getProductBySlug(slug)` (joining `categories`, `product_variants`, and `reviews`) + 3 complementary products from live `aetheria-luxury` Supabase PostgreSQL
- [x] Dynamic `generateMetadata` for SEO title & description
- [x] Top breadcrumb & live telemetry bar (`HOME // OBJECT ARCHIVE // [CATEGORY NAME] // [PRODUCT SKU]`) + `● IN ARCHIVE — READY FOR DISPATCH` badge
- [x] 7/5 split stage (`lg:grid-cols-12`) with sticky left media & 3D inspector (`lg:sticky lg:top-28`) and right precision configuration & conversion deck

### 2. Dual-Mode Studio Gallery & 3D WebGL Spatial Inspector (`src/components/storefront/ProductMediaStage.tsx` & `src/components/canvas/Product3DInspector.tsx`)
- [x] Mode A (`[ 01 // STUDIO PHOTOGRAPHY + LOUPE ]`): High-res studio photograph in an `aspect-[4/5]` Warm Travertine frame, cursor-tracked `2.2×` optical magnifier loupe on desktop, and 3 multi-angle editorial thumbnails (`01 / Studio Three-Quarter`, `02 / Macro Material Detail Crop`, `03 / Architectural Scale & Dimension Blueprint Overlay`)
- [x] Mode B (`[ 02 // 3D WEBGL SPATIAL INSPECTOR ]`): `@react-three/fiber` + `@react-three/drei` 3D Canvas (`ssr: false`) with category-adaptive procedural 3D sculpture (`spatial-audio`, `desk-architecture`, `tactile-computing`, `ambient-lighting`), live variant PBR shader color/metalness/roughness sync, `360°` `<OrbitControls />`, `[ EXPLODE LAYER ]` toggle, and `STUDIO 4800K / ESPRESSO RIM` lighting toggle

### 3. Variant State Machine & Conversion Deck (`src/components/storefront/ProductDetailClient.tsx`)
- [x] Live price calculator (`price_usd + variant.price_modifier_usd`) formatted in active currency (`USD $` / `GBP £` / `EUR €`) + rating summary link that scrolls smoothly to `#collector-reviews`
- [x] Interactive variant selector (`product_variants`) updating active SKU, remaining stock count in that finish, calculated price, and 3D WebGL shader finish in real time
- [x] Tactile quantity stepper (`- / 1 / +`) bounded by variant stock, full-width primary `"Add Object to Bag"` `MagneticButton`, and `"Save to Collector Wishlist ♡"` toggle persisted in Zustand/`localStorage` (`aetheria-wishlist`)
- [x] 3-card Tier-1 Collector Trust & Logistics Ledger (`EXPRESS AIR DISPATCH`, `10-YEAR ARCHIVE WARRANTY`, `30-DAY SANCTUARY TRIAL`)
- [x] 3 expandable `Framer Motion` specification accordions (`01 // DIMENSIONS, MASS & MATERIALS`, `02 // ACOUSTIC & OPTICAL ENGINEERING`, `03 // SHIPPING, CUSTOMS & RETURNS`)

### 4. Verified Collector Reviews & Live Supabase Review Submission (`src/components/storefront/ProductReviewsSection.tsx` & `src/app/actions/reviews.ts`)
- [x] Added RLS policy `"Reviews: public submit field report"` on `public.reviews` in live `aetheria-luxury` Supabase and `supabase/migrations/001_initial_schema.sql`
- [x] Aggregate rating ledger (`Instrument Serif` score, 5-star distribution bars, `100% VERIFIED COLLECTOR HARDWARE` badge) + Verified Review Cards grid
- [x] Interactive `"Submit a Field Report (Write Review)"` drawer with 1–5 star selector, collector name, city/country, headline, and evaluation submitting directly via Server Action `INSERT` into live Supabase `public.reviews`

### 5. "Complete the Architecture" Cross-Sell Module & Sticky Conversion Bar (`src/components/storefront/StickyProductBar.tsx`)
- [x] 3-column `"Complete the Architecture"` cross-sell grid rendered in `Tilt3DCard` components with 1-click `"Add to Bag"` and direct navigation to `/product/[slug]`
- [x] `StickyProductBar.tsx` triggered via `IntersectionObserver` when scrolling past the primary CTA on Mobile (`375px`) and Desktop (`1440px`)
- [x] Linked all product titles across `/`, `/shop`, `BestsellerCarousel`, `QuickInspectModal`, and `SpotlightSearchModal` to `/product/[slug]`


---

## Day 8 — Spatial 3D Slide-Out Cart Drawer, Persistent Wishlist Engine, Free-Shipping Progress Bar & Live Supabase Promo Code Validator

### 1. Persistent Zustand Cart & Wishlist Architecture (`src/store/useCartStore.ts` & `src/store/useWishlistStore.ts`)
- [x] `useCartStore.ts` persisted to `localStorage` under `aetheria-cart-v1` with SSR hydration guard (`hydrateCart()`)
- [x] Composite line-item keying (`${productId}__${variantId || 'default'}`) so adding the same product in different finishes (`Raw Anodized Silver` vs `Obsidian Matte`) creates distinct line items
- [x] Full action suite: `addItem(item, openDrawer = true)` (capped at `maxStock`), `removeItem(lineKey)`, `updateQuantity(lineKey, quantity)`, `applyPromoCode(codeRecord)`, `removePromoCode()`, `clearCart()`
- [x] Computed financial selectors (`computeCartFinancials`): `totalItemsCount`, `subtotalUsd`, `discountAmountUsd` (auto-re-evaluating `min_order_usd`), `shippingUsd` (`$0` when `subtotalUsd >= 150`, else `$25`), `freeShippingRemainingUsd`, `freeShippingProgressPercent`, and `grandTotalUsd`
- [x] `useWishlistStore.ts` persisted to `localStorage` under `aetheria-wishlist-v1` with `toggleWishlistItem`, `isInWishlist`, `removeWishlistItem`, `moveItemToCart`, and `moveAllToCart`

### 2. Spatial 3D Slide-Out Cart Drawer (`src/components/storefront/CartDrawer.tsx`)
- [x] Slide-out drawer (`max-w-[480px]`) with Framer Motion spring physics (`damping: 28, stiffness: 260`) and 3D depth recession (`scale(0.965)`) on `<main>` via `SmoothScrollProvider.tsx`
- [x] Interactive Free Express Shipping Progress Bar animating across the `$150` threshold (Terracotta below `$150` -> Botanical Sage `"✓ COMPLIMENTARY INSURED EXPRESS AIR DISPATCH UNLOCKED"` at/above `$150`)
- [x] Warm Travertine line-item cards with studio thumbnail, SKU badge, title link, selected variant swatch + finish label, quantity stepper (`- / 1 / +`) with max stock cap, `"Save for Later ♡"`, `"Remove ×"`, and currency-reactive line totals
- [x] Architectural Empty Bag state with 4 department pills and 2 flagship `"One-Click Add"` test objects
- [x] Live Supabase Promo Code Engine inside Cart Drawer with 1-click quick-test pills (`[AETHERIA15 • 15% OFF $100+]`, `[TIER1VIP • 20% OFF $300+]`, `[FREESHIP • 10% OFF]`), minimum-spend threshold feedback, and applied discount badge
- [x] In-drawer `"Complete the Sanctuary"` horizontal cross-sell strip (3 live Supabase recommendations excluding items already in the cart)
- [x] Sticky conversion footer with tabular financial ledger (`ARCHIVE SUBTOTAL`, `PRIVILEGE DISCOUNT`, `INSURED AIR DISPATCH`, `ESTIMATED TOTAL`) and `"Proceed to Private Checkout →"` CTA (`/checkout`)

### 3. Collector Wishlist Drawer (`src/components/storefront/WishlistDrawer.tsx`)
- [x] Triggered from the `Navbar` Wishlist Heart pill (`♡ [XX]`), displaying saved objects with studio thumbnail, SKU, finish, converted price, `"Move to Bag →"`, `"Remove ×"`, and header CTA `"Move All Saved Objects to Bag"`

### 4. Global Storefront Wiring
- [x] Connected `Navbar`, `HeroSection`, `BestsellerCarousel`, `CatalogShowcase`, `ShopArchiveClient` (all 3 views), `QuickInspectModal`, `SpotlightSearchModal`, `ProductDetailClient`, and `StickyProductBar` to `useCartStore` and `useWishlistStore`


---

## Day 9 — `/checkout` Private Concierge Checkout, 3D Payment Card Stage, Live Supabase Order Creation, `/order/[id]` Telemetry Tracker & PDF Invoice

### 1. Live Supabase Order RLS & Guest Checkout Migration (`supabase/migrations/002_guest_checkout_orders_rls.sql`)
- [x] Applied live migration `guest_checkout_orders_rls` via Supabase MCP on `aetheria-luxury` (`fvltazfudjmhagpdwouw`), granting `SELECT`, `INSERT`, and `UPDATE` on `public.orders` and `SELECT`, `INSERT` on `public.order_items` for `anon, authenticated` roles
- [x] Updated `.env.example` with optional Stripe / Lemon Squeezy environment keys alongside the built-in Zero-Key Instant Supabase Sandbox Checkout

### 2. Private Concierge Checkout Page (`src/app/checkout/page.tsx` & `src/components/storefront/CheckoutClient.tsx`)
- [x] Top Checkout Security & Telemetry Header (`COLLECTOR BAG // PRIVATE CONCIERGE CHECKOUT // [256-BIT ENCRYPTED DISPATCH]`) + **`"⚡ 1-Click Auto-Fill Tier-1 Demo Collector"`** utility button
- [x] Left Column (`lg:col-span-7`):
  1. `SECTION 01 // COLLECTOR DOSSIER & DESTINATION` (Email, Full Name, Phone, Country Selector across 8 Tier-1 markets, Street, Apartment/Suite, City, State/Province, Postal Code)
  2. `SECTION 02 // INSURED AIR DISPATCH TIER` (`DHL Express Insured Air (DDP)` — complimentary at/above `$150` vs `White-Glove Priority Courier & Acoustic Crating` — `$45.00`)
  3. `SECTION 03 // 3D METALLIC PAYMENT STAGE & METHOD` (`[ 01 // SANDBOX CARD (LIVE SUPABASE DEMO) ]` with `"Fill Test Card (4242)"` vs `[ 02 // 1-CLICK VIP EXPRESS PAY ]`)
- [x] Interactive 3D Perspective Credit Card Visualizer (`src/components/storefront/PaymentCard3D.tsx`): anodized brushed-metal `AETHERIA PRIVATE CLIENT // WORLD ELITE` card with live embossed card number, holder name, expiry, and `180°` `rotateY` flip on CVC focus
- [x] Right Column (`lg:col-span-5`): Sticky Architectural Order Summary with line items, live Supabase promo code bar (`AETHERIA15`, `TIER1VIP`, `FREESHIP`), complete financial ledger (`ARCHIVE SUBTOTAL`, `COLLECTOR PRIVILEGE DISCOUNT`, `INSURED AIR DISPATCH`, `ESTIMATED DUTIES & VAT (DDP INCLUDED)`, `TOTAL AUTHORIZATION`), and primary `"Authorize & Dispatch Order"` `MagneticButton`

### 3. Live Supabase Order Engine (`src/app/api/checkout/route.ts` & `src/app/api/webhooks/payment/route.ts`)
- [x] `POST /api/checkout` generates serialized `AETH-2026-XXXX` order references, inserts master order rows into `public.orders`, inserts purchased line items into `public.order_items`, and returns `{ success: true, orderId, orderNumber }`
- [x] Scaffolded `/api/webhooks/payment` for Stripe / Lemon Squeezy / Sandbox status updates

### 4. Live Order Telemetry Tracker & Printable Tax Invoice (`src/app/order/[id]/page.tsx` & `src/components/storefront/OrderConfirmationClient.tsx`)
- [x] Queries live `public.orders` and joined `public.order_items` by UUID `id`, serialized `order_number` (`AETH-2026-XXXX`), or `"latest"` (`src/lib/supabase/orders.ts`)
- [x] 4-Stage Visual Shipment Telemetry Pipeline (`01 // ORDER AUTHORIZED`, `02 // ACOUSTIC & QC CALIBRATION`, `03 // INSURED DHL AIR DISPATCH`, `04 // DELIVERED TO SANCTUARY`)
- [x] Interactive `"Simulate Live Status Progression"` demo bar (`[ Set: Processing ]`, `[ Set: Shipped ]`, `[ Set: Delivered ]`) performing live Supabase `UPDATE` queries via `src/app/actions/orders.ts`
- [x] Printable / Downloadable Architectural Tax Invoice (`#official-tax-invoice` + `@media print` CSS + `"Download / Print Official Tax Invoice (PDF)"` button) with `PAID IN FULL` seal
- [x] Added `"Track Order"` link in top Utility Bar and interactive `"TRACK SERIALIZED ORDER"` lookup widget in `Footer.tsx`


---

## Day 10 — `/account` Collector Auth Portal, 3D Titanium Membership Pass, Live Supabase Profile & Order Vault, and 1-Click Admin Role Switcher

### 1. Live Supabase Profiles & RLS Migration (`supabase/migrations/003_collector_portal_profiles_rls.sql`)
- [x] Applied migration `collector_portal_profiles_rls` via Supabase MCP on `aetheria-luxury` (`fvltazfudjmhagpdwouw`):
  1. Confirmed `on_auth_user_created` trigger automatically provisions rows in `public.profiles`
  2. Seeded the Founding Tier-1 VIP Collector (`julian.vance@aetheria.studio`, ID `f0000000-0000-4000-8000-000000000001`) in `auth.users` & `public.profiles` and associated matching orders in `public.orders`
  3. Granted `SELECT`, `INSERT`, and `UPDATE` on `public.profiles` with RLS policies supporting profile edits, default shipping address sync, and 1-click role switching (`customer` ↔ `admin`)

### 2. Luxury Authentication Gateway (`src/app/account/page.tsx` & `src/components/storefront/AccountPortalClient.tsx`)
- [x] Unauthenticated split-screen gateway with Left Editorial Sanctuary & 3D Brushed Titanium Collector Pass preview and Right Dual-Mode Sign In (`[ 01 // SIGN IN TO ARCHIVE ]`) / Create Dossier (`[ 02 // CREATE COLLECTOR DOSSIER ]`) form
- [x] **`"⚡ 1-Click VIP Collector Demo Access"`** button that authenticates immediately as `Julian Vance` (`julian.vance@aetheria.studio`) against live Supabase `public.profiles` and `public.orders` with zero email-confirmation friction

### 3. Authenticated Collector Portal & 3D Membership Pass (`src/components/storefront/CollectorPass3D.tsx`)
- [x] Interactive 3D Brushed Titanium Collector Pass with cursor-tracked `rotateX`/`rotateY` tilt, champagne specular glare, serialized barcode, Collector Name & Email, Member ID (`AETH-MEM-2026-0001`), Status Tier Badge (`FOUNDING COLLECTOR // TIER-1 VERIFIED`), Total Archive Valuation, and **Live Role Switcher Pill (`[ ROLE: COLLECTOR ]` ↔ `[ ROLE: MERCHANT ADMIN ]`)** updating `public.profiles.role` in live Supabase
- [x] **Tab 01 // Serialized Order Archive & Live Telemetry:** Lists all live `public.orders` joined with `public.order_items` with thumbnails, status badges, `"Live Telemetry & Invoice →"` (`/order/[id]`), `"1-Click Reorder to Bag"`, and `"Download Tax Receipt"`
- [x] **Tab 02 // Hardware Warranty Vault & Certificates of Authenticity:** Generates serialized 10-year hardware warranty certificate cards (`SN-AETH-6061-XXXX`, valid through `2036`) for every purchased object with `"Print / Verify Certificate"` action
- [x] **Tab 03 // Sanctuary Dispatch Dossier (Live Supabase `profiles` Editor):** Edits and saves Full Name, Phone Number, and Default Tier-1 Shipping Address directly to `public.profiles` in live Supabase (`✓ DISPATCH DOSSIER SYNCED TO LIVE SUPABASE`) and auto-populates `/checkout` (`CheckoutClient.tsx`)

### 4. Global Auth State & Navbar Integration (`src/store/useAuthStore.ts` & `src/components/storefront/Navbar.tsx`)
- [x] Persisted auth session in `useAuthStore` (`aetheria-auth-v1`) hydrated in `SmoothScrollProvider.tsx`
- [x] Added `AccountPill` in `Navbar.tsx` displaying `[ Sign In ]` when signed out and `[ ● JV ]` / `[ ● ADMIN ]` when signed in
- [x] Added `"View in Collector Portal (/account) →"` button on `/order/[id]` (`OrderConfirmationClient.tsx`)


---

## Day 11 — `/admin` No-Code Merchant Studio, Executive Telemetry, Product CRUD + Supabase Storage Image Uploader, Live Order Board & Promo Manager

### 1. Supabase Storage Bucket (`product-images`) & Merchant CRUD RLS (`supabase/migrations/004_merchant_admin_studio_storage_and_rls.sql`)
- [x] Applied migration `merchant_admin_studio_storage_and_rls` via Supabase MCP on `aetheria-luxury` (`fvltazfudjmhagpdwouw`), provisioning the public **`product-images`** Supabase Storage bucket with `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies on `storage.objects`
- [x] Added `fvltazfudjmhagpdwouw.supabase.co` and `**.supabase.co` to `images.remotePatterns` in `next.config.ts`
- [x] Enabled Merchant Studio `SELECT`, `INSERT`, `UPDATE`, and `DELETE` RLS policies on `public.products`, `public.product_variants`, `public.orders`, and `public.discount_codes`

### 2. Admin Access Gate & Responsive Architectural Shell (`src/app/admin/page.tsx` & `src/components/admin/AdminStudioClient.tsx`)
- [x] Access Guard screen with **`"⚡ 1-Click Activate Merchant Admin Studio"`** button (elevates active profile role to `'admin'` in live Supabase `public.profiles`)
- [x] Desktop (`>= 1024px`) Warm Travertine left architectural rail (`AETHERIA® // STUDIO OPS`, `● LIVE: AETHERIA-LUXURY` telemetry badge, 4 primary tabs, currency/theme switchers, and `"← View Live Storefront"`) + Mobile/Tablet (`< 1024px`) sticky horizontal tab strip
- [x] Added `[ ADMIN STUDIO ]` quick-entry badge in `Navbar.tsx` whenever `role === 'admin'`

### 3. Tab 01 // Executive Telemetry & Revenue Analytics (`src/components/admin/AdminOverviewTab.tsx`)
- [x] 4 Spatial 3D KPI Metric Cards (`Tilt3DCard`): `GROSS ARCHIVE REVENUE`, `ACTIVE DISPATCHES` (`Processing` / `Shipped` / `Delivered`), `AVERAGE COLLECTOR AOV`, and `CATALOG & STOCK HEALTH` (with low-stock alerts)
- [x] Pure SVG + Framer Motion animated charts: `Chart A` (Archive Valuation & Sales by Architectural Department) and `Chart B` (Order Velocity Pipeline Breakdown)
- [x] Recent Live Dispatches Feed showing the 5 most recent rows from `public.orders` with 1-click `"Manage →"` jump to Tab 03

### 4. Tab 02 // No-Code Object Archive, Inventory & Supabase Storage Uploader (`src/components/admin/AdminProductsTab.tsx` & `src/components/admin/ProductEditorDrawer.tsx`)
- [x] Instant search by Title/SKU, Department filter, and **`"+ Commission New Object"`** `MagneticButton`
- [x] Editorial Inventory Ledger with studio thumbnails, SKUs, inline quick stock adjuster (`- / count / +`), inline `Featured` & `Bestseller` toggle switches, and `[ Edit ]` / `[ Delete ]` actions synced live to `public.products`
- [x] Slide-Over `"Commission / Edit Object"` Drawer with full product metadata fields and **Live Supabase Storage Image Uploader** (`supabase.storage.from('product-images').upload(...)` + `getPublicUrl()` + 1-click sample studio plate upload tester)

### 5. Tab 03 // Live Dispatch & Order Management Board (`src/components/admin/AdminOrdersTab.tsx`)
- [x] Status filter pills (`All`, `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) with live counts + search by Order Number, Collector Name, or Email
- [x] Interactive Live Status Selector on every order row performing immediate `UPDATE` queries on `public.orders.status`
- [x] Slide-Over Order Dossier Inspector displaying full `shipping_address` JSONB, itemized `order_items`, payment authorization ID, and direct link to `/order/[id]`

### 6. Tab 04 // Privilege & Discount Code Manager (`src/components/admin/AdminDiscountsTab.tsx`)
- [x] `"+ Issue New Privilege Code"` creator bar (`Code`, `Discount %`, `Min Order USD`, `Description`) inserting directly into live `public.discount_codes`
- [x] Live Codes Ledger with real-time `ACTIVE` / `PAUSED` toggle switch (`is_active`) and delete action


---

## Day 12 — Tier-1 Technical SEO, JSON-LD Rich Snippets, Dynamic Sitemap, US/UK/EU Brand & Legal Pages, Live Concierge/Newsletter DB & 4-Device Audit

### 1. Live Supabase Engagement Tables & Server Actions (`supabase/migrations/005_concierge_and_newsletter.sql` & `src/app/actions/engagement.ts`)
- [x] Applied migration `concierge_and_newsletter_engagement_tables` via Supabase MCP on `aetheria-luxury` (`fvltazfudjmhagpdwouw`):
  1. `public.contact_inquiries` (`id`, `full_name`, `email`, `subject`, `order_reference`, `message`, `status`, `created_at`) with RLS policies (`INSERT` for `anon, authenticated`, `SELECT` for concierge/admin)
  2. `public.newsletter_subscribers` (`id`, `email` unique, `source`, `created_at`) with RLS policies (`INSERT` for `anon, authenticated`, `SELECT` for concierge/admin)
- [x] Built `submitConciergeInquiryAction` and `subscribeNewsletterAction` (gracefully handling PostgreSQL `23505` duplicate emails with `"Already on the Private Archive List"`)

### 2. Tier-1 Technical SEO, JSON-LD Rich Snippets, Dynamic Sitemap & Robots (`src/lib/seo/json-ld.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`)
- [x] Built `getOrganizationSchema`, `getWebsiteSchema`, `getProductSchema` (`Offer`, `AggregateRating`, `Review`, `OfferShippingDetails`, `MerchantReturnPolicy`), and `getBreadcrumbSchema`
- [x] Injected `Organization` + `WebSite` JSON-LD scripts in `src/app/layout.tsx` with `%s | AETHERIA® — Architectural Audio & Desk Objects` title template, OpenGraph, and Twitter Large Image Cards
- [x] Injected `Product` + `BreadcrumbList` JSON-LD scripts and dynamic `generateMetadata()` in `src/app/product/[slug]/page.tsx` and `BreadcrumbList` JSON-LD in `src/app/shop/page.tsx`
- [x] Built dynamic `src/app/sitemap.ts` querying all 12 live product slugs and 4 category routes from `aetheria-luxury` Supabase along with static brand/legal pages
- [x] Built `src/app/robots.ts` allowing public routes while disallowing `/admin`, `/checkout`, `/account`, `/order/`, and `/api/`

### 3. 5 Tier-1 Brand, Trust & Legal Pages (`src/app/about`, `/contact`, `/shipping-returns`, `/privacy`, `/terms`)
- [x] `/about` (`src/app/about/page.tsx`): *"Objects Engineered to Outlast Obsolescence."* hero (`EST. 2026 // ZURICH & COPENHAGEN DESIGN ARCHIVE`), 3-card `Tilt3DCard` architectural metric strip (`14 HRS`, `TIVOLI, IT`, `10 YEARS`), and 3-chapter Atelier Storytelling Grid
- [x] `/contact` (`src/app/contact/page.tsx` & `src/components/storefront/ContactConciergeClient.tsx`): Split-screen Private Client Concierge with direct channels (`< 4 Hours` SLA), 3 Flagship Listening Studios (Zurich, New York SoHo, London Mayfair), 5-question Tier-1 FAQ Accordion, and Live Supabase Concierge Inquiry Form (`TICKET #CONC-XXXX LOGGED IN ARCHIVE`)
- [x] `/shipping-returns` (`src/app/shipping-returns/page.tsx`): Tier-1 Global DDP Logistics Matrix (US, UK, EU, CA, AU/NZ) with desktop table & mobile card stack + 3-step `30-Day Sanctuary Trial & Insured Return Protocol`
- [x] `/privacy` (`src/app/privacy/page.tsx`) & `/terms` (`src/app/terms/page.tsx`): Editorial legal layout with sticky left section navigator (`01 //` – `04 //`), `LAST UPDATED: NOVEMBER 2026` badge, and authentic GDPR, UK DPA, California CCPA/CPRA, and Incoterms® 2020 DDP compliance language

### 4. Luxury Error Boundaries, 404 Page & Complete Link/Newsletter Wiring
- [x] Created `src/app/not-found.tsx` (`404 // COORDINATE NOT FOUND IN ARCHIVE`), `src/app/loading.tsx`, and `src/app/error.tsx`
- [x] Wired `Footer.tsx` Newsletter form to live Supabase `public.newsletter_subscribers` and wired all navigation links in `Navbar.tsx`, `MobileDrawer.tsx`, and `Footer.tsx` with zero `#` dead links
- [x] Verified across Desktop (`1440px`), Laptop (`1280px`), Tablet (`768px`), and Mobile (`375px`) with 0 console errors and 0 horizontal overflow


---

## Day 13 — Production Build (`npm run build`) Zero-Error Audit, Live E2E Verification, Performance Polish & Gumroad/Reels Commercial Sales Kit

### 1. Zero-Error Production Build & TypeScript Hardening
- [x] `npx tsc --noEmit` & `npx eslint src`: Passed with **0 errors, 0 warnings**
- [x] `npm run build` (Next.js 16.4.6 Turbopack with `cacheComponents: true` & `partialPrefetching: true`): Exited with **status code 0** (`19/19` static and partial-prerender routes compiled cleanly in `13.7s`)
- [x] Confirmed client-only dynamic boundaries (`{ ssr: false }`) on `Hero3DStage` and `Product3DInspector` and `<Suspense>` boundaries across `/shop`, `/product/[slug]`, `/order/[id]`, `/account`, and `/admin`

### 2. Live Supabase (`aetheria-luxury`) Data & RLS Hygiene Audit
- [x] Audited live PostgreSQL tables via Supabase MCP (`4` categories, `12` products, `27` product variants, `4` active discount codes: `AETHERIA15`, `FREESHIP`, `STUDIO10`, `TIER1VIP`, `17` collector reviews)
- [x] Polished live `public.orders` and `public.order_items` so `/admin` displays 3 museum-grade Tier-1 collector dispatches across all 4 departments (`AETH-2026-8840` Henrik Lindqvist in Zürich `delivered` `$818.50`, `AETH-2026-2667` Clara Kensington in London Mayfair `processing` `$540.00`, and `AETH-2026-9213` Julian Vance in New York SoHo `shipped` `$1,200.00` — Total Gross Archive Revenue `$2,558.50`)

### 3. Production Server (`npm run start`) 4-Device E2E Verification
- [x] Started compiled production build via `npm run start` (`http://localhost:3000`) and verified every route (`/`, `/shop`, `/product/[slug]`, `/checkout`, `/order/[id]`, `/account`, `/admin`, `/about`, `/contact`, `/shipping-returns`, `/privacy`, `/terms`, `/sitemap.xml`, `/robots.txt`, and custom `404`) with **HTTP 200** and **0 console or hydration errors**
- [x] Verified **Warm Daylight (`#F7F4EF`)** ↔ **Velvet Espresso (`#181615`)** theme switching and **Currency (`USD $` / `GBP £` / `EUR €`)** conversion across storefront and `/admin` KPIs
- [x] Confirmed **0 horizontal overflow** across Desktop (`1440px`), Laptop (`1280px`), Tablet (`768px`), and Mobile (`375px`)

### 4. Commercial Launch & Marketing Kit (`/marketing-kit/`)
- [x] Generated `marketing-kit/GUMROAD_SALES_PAGE_COPY.md` (High-converting title/subtitle, Solo Founder `$149` & Agency `$249` tiers, Feature-to-ROI breakdown, technical stack table, and 6 buyer FAQs)
- [x] Generated `marketing-kit/DEMO_AND_REELS_SCRIPT.md` (60-second Gumroad cover video timestamped shotlist, 3 viral 15-second Instagram Reel scripts with Comment-to-DM triggers, and 1 Medium technical walkthrough outline)


---

## Day 14 (FINAL) — Detached Commercial Release Export, Complete Personal-Key Scrubbing, Consolidated 1-Click Supabase SQL, `AGENTS.md` & Clean-Room Build Verification

### 1. Detached Commercial Release Directory (`exports/aetheria-3d-ecommerce-boilerplate/`)
- [x] Created clean standalone deliverable directory at `exports/aetheria-3d-ecommerce-boilerplate/` while keeping the live root workspace (`aetheria-luxury`) 100% intact for user demos and screen recordings
- [x] Strictly excluded `.env.local`, `.env*`, `marketing-kit/`, `PRD.md`, `PRD_PROGRESS.md`, `.git/`, `node_modules/`, `.next/`, and `.vercel/`

### 2. Deep Security & Personal Data Scrubbing
- [x] Scrubbed all occurrences of `fvltazfudjmhagpdwouw`, `aetheria-luxury`, JWT tokens (`eyJhbGci`), and personal details (`0` matches across the entire exported package)
- [x] Genericized `exports/aetheria-3d-ecommerce-boilerplate/next.config.ts` to use the universal Supabase Storage wildcard pattern (`hostname: "**.supabase.co"`)
- [x] Updated UI telemetry badges in `AdminStudioClient.tsx` and `loading.tsx` to display dynamic connection state (`● LIVE: SUPABASE POSTGRESQL` vs `● SANDBOX PREVIEW MODE (ADD SUPABASE KEYS)`)
- [x] Created documented `.env.example` with clean placeholders for Supabase, Canonical Site URL, and optional Stripe / Lemon Squeezy keys

### 3. Consolidated 1-Click Supabase Setup (`exports/aetheria-3d-ecommerce-boilerplate/supabase/`)
- [x] `supabase/migrations/001_complete_schema.sql`: Consolidated idempotent SQL script creating all 10 tables (`categories`, `products`, `product_variants`, `reviews`, `discount_codes`, `profiles`, `orders`, `order_items`, `contact_inquiries`, `newsletter_subscribers`), indexes, triggers (`set_updated_at`, `on_auth_user_created`), public `product-images` Storage bucket + policies, and complete Row Level Security policies
- [x] `supabase/seed.sql`: Consolidated 1-click seed script populating 4 categories, 12 luxury products, 27 variants, 16 verified reviews, 3 promo codes (`AETHERIA15`, `TIER1VIP`, `FREESHIP`), Founding Collector profile (`Julian Vance`), and 2 sample orders (`AETH-2026-9213` & `AETH-2026-8840`)

### 4. Tier-1 Buyer Documentation & AI Playbook
- [x] `AGENTS.md` — Complete AI Coding Agent Playbook (architecture rules, folder/state map, CSS custom property rebranding table, 3D WebGL customization guide, and 3 copy-paste `"1-Prompt Rebrand"` examples)
- [x] `README.md` — Executive product overview, 6-pillar feature matrix, quick-start commands, and documentation index
- [x] `SETUP_GUIDE.md` — Step-by-step 5-minute launch checklist (Zero-Key Sandbox Preview -> Supabase 1-Click SQL -> `/admin` Storage Upload -> Stripe/Lemon Squeezy -> Vercel Deploy & Rich Results Verification)
- [x] `LICENSE_COMMERCIAL.md` — Solo Founder & Agency Unlimited commercial license agreement

### 5. Clean-Room Zero-Env Build Verification & Commercial ZIP Archive
- [x] Verified `npx tsc --noEmit` and `npm run build` inside `exports/aetheria-3d-ecommerce-boilerplate/` **with zero `.env.local` file present** (`Exit code 0`, `19/19` routes compiled cleanly)
- [x] Packaged final lightweight deliverable at `exports/aetheria-3d-ecommerce-boilerplate-v1.0.zip`



