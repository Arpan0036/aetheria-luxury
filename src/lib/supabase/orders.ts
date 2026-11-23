import { createPublicClient } from "./server";
import type {
  OrderItemRecord,
  OrderRecord,
  OrderShippingAddress,
  OrderStatus,
} from "@/types/database";

type Row = Record<string, unknown>;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SEED_ORDERS: OrderRecord[] = [
  {
    id: "99000000-0000-4000-8000-000000008840",
    order_number: "AETH-2026-8840",
    user_id: "f0000000-0000-4000-8000-000000000001",
    customer_email: "henrik.lindqvist@nordic-acoustics.ch",
    customer_name: "Henrik Lindqvist",
    shipping_address: {
      street: "Bahnhofstrasse 48",
      apartment: "Floor 4",
      city: "Zürich",
      state: "ZH",
      postal_code: "8001",
      country: "Switzerland",
      phone: "+41 44 580 26 90",
      shipping_tier: "white-glove",
      payment_method: "vip-express",
      card_last4: "8840",
      promo_code: "AETHERIA15",
    },
    subtotal_usd: 730,
    discount_usd: 109.5,
    shipping_usd: 45,
    total_usd: 665.5,
    currency: "USD",
    status: "delivered",
    payment_intent_id: "sandbox_aeth_8840_zurich",
    created_at: "2026-11-18T18:10:00.000Z",
    updated_at: "2026-11-20T14:25:00.000Z",
    mode: "local-fallback",
    items: [
      {
        id: "99000000-0000-4000-8000-000000008841",
        order_id: "99000000-0000-4000-8000-000000008840",
        product_id: "a0000000-0000-4000-8000-000000000003",
        variant_id: "b0000000-0000-4000-8000-000000000006",
        product_title: "KINETIC-65 Field Mechanical Keyboard",
        variant_name: "Stone Grey",
        quantity: 1,
        unit_price_usd: 420,
        created_at: "2026-11-18T18:10:00.000Z",
      },
      {
        id: "99000000-0000-4000-8000-000000008842",
        order_id: "99000000-0000-4000-8000-000000008840",
        product_id: "a0000000-0000-4000-8000-000000000007",
        variant_id: "b0000000-0000-4000-8000-000000000015",
        product_title: "SOLARIS Halo Atmospheric Lamp",
        variant_name: "Frosted Dawn",
        quantity: 1,
        unit_price_usd: 310,
        created_at: "2026-11-18T18:10:00.000Z",
      },
    ],
  },
  {
    id: "22ff215d-ff45-4d79-b822-8736e9e3ad0c",
    order_number: "AETH-2026-9213",
    user_id: "f0000000-0000-4000-8000-000000000001",
    customer_email: "julian.vance@aetheria.studio",
    customer_name: "Julian Vance",
    shipping_address: {
      street: "412 Mercer St",
      apartment: "Penthouse B",
      city: "New York",
      state: "NY",
      postal_code: "10013",
      country: "United States",
      phone: "+1 (212) 555-0194",
      shipping_tier: "dhl-ddp",
      payment_method: "sandbox-card",
      card_last4: "4242",
      promo_code: "TIER1VIP",
    },
    subtotal_usd: 1500,
    discount_usd: 300,
    shipping_usd: 0,
    total_usd: 1200,
    currency: "USD",
    status: "shipped",
    payment_intent_id: "sandbox_aeth_9213_soho",
    created_at: "2026-11-18T15:42:48.000Z",
    updated_at: "2026-11-19T09:15:00.000Z",
    mode: "local-fallback",
    items: [
      {
        id: "22ff215d-ff45-4d79-b822-8736e9e3ad01",
        order_id: "22ff215d-ff45-4d79-b822-8736e9e3ad0c",
        product_id: "a0000000-0000-4000-8000-000000000001",
        variant_id: "b0000000-0000-4000-8000-000000000001",
        product_title: "AETHER-01 Spatial Reference Headphones",
        variant_name: "Raw Anodized Silver",
        quantity: 2,
        unit_price_usd: 540,
        created_at: "2026-11-18T15:42:48.000Z",
      },
      {
        id: "22ff215d-ff45-4d79-b822-8736e9e3ad02",
        order_id: "22ff215d-ff45-4d79-b822-8736e9e3ad0c",
        product_id: "a0000000-0000-4000-8000-000000000003",
        variant_id: "b0000000-0000-4000-8000-000000000006",
        product_title: "KINETIC-65 Field Mechanical Keyboard",
        variant_name: "Stone Grey",
        quantity: 1,
        unit_price_usd: 420,
        created_at: "2026-11-18T15:42:48.000Z",
      },
    ],
  },
];

function findSeedOrder(clean: string): OrderRecord | null {
  if (clean.toLowerCase() === "latest") {
    return SEED_ORDERS[0] ?? null;
  }
  const upper = clean.toUpperCase();
  return (
    SEED_ORDERS.find(
      (o) => o.id.toLowerCase() === clean.toLowerCase() || o.order_number === upper,
    ) ?? null
  );
}

function num(v: unknown, d = 0): number {
  return v === null || v === undefined ? d : Number(v);
}

function toOrderItem(r: Row): OrderItemRecord {
  return {
    id: String(r.id),
    order_id: String(r.order_id),
    product_id: String(r.product_id),
    variant_id: r.variant_id ? String(r.variant_id) : null,
    product_title: String(r.product_title ?? "AETHERIA Object"),
    variant_name: r.variant_name ? String(r.variant_name) : null,
    quantity: num(r.quantity, 1),
    unit_price_usd: num(r.unit_price_usd, 0),
    created_at: String(r.created_at ?? new Date().toISOString()),
  };
}

export function normalizeOrderRow(row: Row & { order_items?: Row[] }): OrderRecord {
  const items = Array.isArray(row.order_items) ? row.order_items.map(toOrderItem) : [];
  return {
    id: String(row.id),
    order_number: String(row.order_number),
    user_id: row.user_id ? String(row.user_id) : null,
    customer_email: String(row.customer_email ?? ""),
    customer_name: String(row.customer_name ?? ""),
    shipping_address: (row.shipping_address as OrderShippingAddress) ?? {},
    subtotal_usd: num(row.subtotal_usd),
    discount_usd: num(row.discount_usd),
    shipping_usd: num(row.shipping_usd),
    total_usd: num(row.total_usd),
    currency: (row.currency as OrderRecord["currency"]) ?? "USD",
    status: (row.status as OrderStatus) ?? "processing",
    payment_intent_id: row.payment_intent_id ? String(row.payment_intent_id) : null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
    items,
    mode: "supabase-live",
  };
}

/**
 * Fetches an order + its joined `order_items` from live Supabase by UUID `id`,
 * serialized `order_number` (`AETH-2026-XXXX`), or `"latest"`.
 */
export async function getOrderByIdentifier(identifier: string): Promise<OrderRecord | null> {
  const clean = decodeURIComponent(identifier).trim();
  if (!clean) return null;

  const supabase = createPublicClient();
  if (!supabase) return findSeedOrder(clean);

  try {
    if (clean.toLowerCase() === "latest") {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        return normalizeOrderRow(data as Row & { order_items?: Row[] });
      }
      return findSeedOrder(clean);
    }

    const isUuid = UUID_REGEX.test(clean);
    const column = isUuid ? "id" : "order_number";
    const value = isUuid ? clean : clean.toUpperCase();

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq(column, value)
      .maybeSingle();

    if (!error && data) {
      return normalizeOrderRow(data as Row & { order_items?: Row[] });
    }
  } catch {
    /* ignore */
  }

  return findSeedOrder(clean);
}
