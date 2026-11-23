/**
 * Generates supabase/seed.sql from src/lib/supabase/fallback-data.ts so the
 * live database and the local fallback can never drift apart.
 *
 *   npm run db:seed:generate
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_VARIANTS,
  SEED_REVIEWS,
  SEED_DISCOUNT_CODES,
} from "../src/lib/supabase/fallback-data.ts";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../supabase/seed.sql");

const q = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const arr = (a) => (a.length ? `array[${a.map(q).join(", ")}]::text[]` : `'{}'::text[]`);
const json = (o) => `${q(JSON.stringify(o))}::jsonb`;

function upsert(table, columns, rows, conflict = "id") {
  const values = rows.map((r) => `  (${r.join(", ")})`).join(",\n");
  const updates = columns
    .filter((c) => c !== conflict)
    .map((c) => `${c} = excluded.${c}`)
    .join(",\n  ");
  return `insert into public.${table} (${columns.join(", ")}) values\n${values}\non conflict (${conflict}) do update set\n  ${updates};\n`;
}

const parts = [
  `-- =============================================================================
--  AETHERIA — seed.sql  (GENERATED — do not edit by hand)
--  Source: src/lib/supabase/fallback-data.ts · regenerate: npm run db:seed:generate
--  ${SEED_CATEGORIES.length} categories · ${SEED_PRODUCTS.length} products · ${SEED_VARIANTS.length} variants · ${SEED_REVIEWS.length} reviews · ${SEED_DISCOUNT_CODES.length} discount codes
--  Idempotent upserts keyed on deterministic UUIDs.
-- =============================================================================
begin;
`,
  upsert(
    "categories",
    ["id", "name", "slug", "subtitle", "description", "image_url", "display_order"],
    SEED_CATEGORIES.map((c) => [q(c.id), q(c.name), q(c.slug), q(c.subtitle), q(c.description), q(c.image_url), q(c.display_order)]),
  ),
  upsert(
    "products",
    [
      "id", "category_id", "sku", "title", "slug", "tagline", "description", "price_usd",
      "compare_at_price_usd", "rating", "review_count", "stock_count", "is_featured",
      "is_bestseller", "is_new_arrival", "materials", "dimensions", "weight",
      "warranty_info", "specs", "images", "three_d_config",
    ],
    SEED_PRODUCTS.map((p) => [
      q(p.id), q(p.category_id), q(p.sku), q(p.title), q(p.slug), q(p.tagline), q(p.description),
      q(p.price_usd), q(p.compare_at_price_usd), q(p.rating), q(p.review_count), q(p.stock_count),
      q(p.is_featured), q(p.is_bestseller), q(p.is_new_arrival), arr(p.materials), q(p.dimensions),
      q(p.weight), q(p.warranty_info), json(p.specs), arr(p.images), json(p.three_d_config),
    ]),
  ),
  upsert(
    "product_variants",
    ["id", "product_id", "sku", "variant_name", "color_hex", "price_modifier_usd", "stock_count"],
    SEED_VARIANTS.map((v) => [q(v.id), q(v.product_id), q(v.sku), q(v.variant_name), q(v.color_hex), q(v.price_modifier_usd), q(v.stock_count)]),
  ),
  upsert(
    "reviews",
    ["id", "product_id", "author_name", "author_city", "rating", "title", "comment", "verified_purchase", "created_at"],
    SEED_REVIEWS.map((r) => [q(r.id), q(r.product_id), q(r.author_name), q(r.author_city), q(r.rating), q(r.title), q(r.comment), q(r.verified_purchase), q(r.created_at)]),
  ),
  upsert(
    "discount_codes",
    ["id", "code", "description", "discount_percent", "min_order_usd", "is_active", "expires_at"],
    SEED_DISCOUNT_CODES.map((d) => [q(d.id), q(d.code), q(d.description), q(d.discount_percent), q(d.min_order_usd), q(d.is_active), q(d.expires_at)]),
  ),
  "commit;\n",
];

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, parts.join("\n"), "utf8");
console.log(`✓ Wrote ${out}`);
