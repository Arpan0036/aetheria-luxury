/**
 * AETHERIA — strict domain types mirroring supabase/migrations/001_initial_schema.sql.
 * Numeric columns are normalised to `number` by the data layer.
 */

export type CategorySlug =
  | "spatial-audio"
  | "desk-architecture"
  | "tactile-computing"
  | "ambient-lighting";

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  subtitle: string;
  description: string;
  image_url: string | null;
  display_order: number;
}

export type ProceduralShape =
  | "headphones"
  | "lamp"
  | "keyboard"
  | "obelisk"
  | "dial"
  | "tray"
  | "halo"
  | "riser"
  | "amplifier"
  | "mat"
  | "macropad"
  | "lantern";

/** Drives the procedural previews today and the WebGL product stage in later phases. */
export interface ThreeDConfig {
  shape: ProceduralShape;
  finish: string;
  metallic: number; // 0..1
  roughness: number; // 0..1
  base_hex: string;
  accent_hex: string;
}

export interface ProductSpecs {
  [label: string]: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  color_hex: string;
  price_modifier_usd: number;
  stock_count: number;
}

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  author_city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

/** Review joined with the purchased product, for the social-proof marquee. */
export interface ReviewWithProduct extends Review {
  product_title: string;
  product_sku: string;
}

export interface ReviewsFeed {
  mode: ConnectionMode;
  reviews: ReviewWithProduct[];
  average_rating: number;
  verified_ratio: number;
}

export interface Product {
  id: string;
  category_id: string;
  sku: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  price_usd: number;
  compare_at_price_usd: number | null;
  rating: number;
  review_count: number;
  stock_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  materials: string[];
  dimensions: string;
  weight: string;
  warranty_info: string;
  specs: ProductSpecs;
  images: string[];
  three_d_config: ThreeDConfig;
}

/** Catalog card shape: product + its category slug + variants. */
export interface CatalogProduct extends Product {
  category_slug: CategorySlug;
  variants: ProductVariant[];
}

export interface ProductDetail extends CatalogProduct {
  category: Category;
  reviews: Review[];
}

export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  min_order_usd: number;
  is_active: boolean;
  expires_at: string | null;
}

export type ConnectionMode = "supabase-live" | "local-fallback";

export interface DatabaseStatus {
  mode: ConnectionMode;
  /** Why fallback was used (unconfigured, unreachable, unseeded…). */
  reason: string | null;
  rlsEnabled: boolean;
  checkedAt: string;
}

export interface CatalogOverview {
  status: DatabaseStatus;
  categories: (Category & { product_count: number })[];
  products: CatalogProduct[];
}

export type ProductSort = "featured" | "price-asc" | "price-desc" | "top-rated" | "sku";

export type ArchiveLayoutMode = "grid-3" | "gallery-2" | "ledger";

export interface ProductQuery {
  categorySlug?: CategorySlug | "all";
  featuredOnly?: boolean;
  bestsellerOnly?: boolean;
  newArrivalOnly?: boolean;
  inStockOnly?: boolean;
  minPriceUsd?: number;
  maxPriceUsd?: number;
  materialFilter?: string;
  sortBy?: ProductSort;
  searchQuery?: string;
}

export type DiscountValidation =
  | {
      valid: true;
      code: string;
      description: string;
      discount_percent: number;
      min_order_usd: number;
      discount_usd: number;
      new_subtotal_usd: number;
      mode: ConnectionMode;
    }
  | {
      valid: false;
      code: string;
      reason: "not-found" | "inactive" | "expired" | "below-minimum" | "empty";
      message: string;
      min_order_usd?: number;
      mode: ConnectionMode;
    };

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderShippingAddress {
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  shipping_tier?: "dhl-ddp" | "white-glove";
  promo_code?: string | null;
  card_last4?: string;
  payment_method?: "sandbox-card" | "vip-express";
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_title: string;
  variant_name: string | null;
  quantity: number;
  unit_price_usd: number;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  shipping_address: OrderShippingAddress;
  subtotal_usd: number;
  discount_usd: number;
  shipping_usd: number;
  total_usd: number;
  currency: "USD" | "GBP" | "EUR";
  status: OrderStatus;
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItemRecord[];
  mode: ConnectionMode;
}

export type CollectorRole = "customer" | "admin";

export interface CollectorProfile {
  id: string;
  email: string;
  full_name: string;
  role: CollectorRole;
  default_shipping_address: OrderShippingAddress | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStudioSnapshot {
  mode: ConnectionMode;
  categories: Category[];
  products: CatalogProduct[];
  orders: OrderRecord[];
  discountCodes: DiscountCode[];
}

export interface UpsertProductInput {
  id?: string;
  category_id: string;
  sku: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  price_usd: number;
  compare_at_price_usd: number | null;
  stock_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  materials: string[];
  dimensions: string;
  weight: string;
  images: string[];
}

export type ConciergeInquiryTopic =
  | "Product Specification"
  | "Order Dispatch"
  | "Trade & Architectural Inquiry"
  | "Warranty Claim";

export interface ContactInquiry {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  order_reference: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface ConciergeInquiryInput {
  full_name: string;
  email: string;
  subject: ConciergeInquiryTopic | string;
  order_reference?: string | null;
  message: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

