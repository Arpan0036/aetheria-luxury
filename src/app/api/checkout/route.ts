import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { normalizeOrderRow, SEED_ORDERS } from "@/lib/supabase/orders";
import type { OrderShippingAddress } from "@/types/database";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface CheckoutLinePayload {
  productId: string;
  variantId?: string | null;
  title: string;
  variantName?: string | null;
  quantity: number;
  unitPriceUsd: number;
}

interface CheckoutRequestPayload {
  userId?: string | null;
  customerEmail: string;
  customerName: string;
  shippingAddress: OrderShippingAddress;
  subtotalUsd: number;
  discountUsd: number;
  shippingUsd: number;
  totalUsd: number;
  currency: "USD" | "GBP" | "EUR";
  items: CheckoutLinePayload[];
}

function generateOrderNumber(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AETH-2026-${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestPayload;

    const customerEmail = (body.customerEmail ?? "").trim();
    const customerName = (body.customerName ?? "").trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { success: false, error: "Collector name and email address are required." },
        { status: 400 },
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your collector bag is empty." },
        { status: 400 },
      );
    }

    const orderNumber = generateOrderNumber();
    const paymentIntentId = `sandbox_aeth_${Date.now()}`;
    const subtotalUsd = Math.max(0, Number(body.subtotalUsd) || 0);
    const discountUsd = Math.max(0, Number(body.discountUsd) || 0);
    const shippingUsd = Math.max(0, Number(body.shippingUsd) || 0);
    const totalUsd = Math.max(
      0,
      Math.round((subtotalUsd - discountUsd + shippingUsd) * 100) / 100,
    );
    const currency =
      body.currency === "GBP" || body.currency === "EUR" ? body.currency : "USD";

    const supabase = createPublicClient();
    if (!supabase) {
      const fallbackOrder = SEED_ORDERS[1] ?? SEED_ORDERS[0];
      return NextResponse.json({
        success: true,
        orderId: fallbackOrder.id,
        orderNumber: fallbackOrder.order_number,
        paymentMode: "local-sandbox-fallback",
        order: {
          ...fallbackOrder,
          customer_email: customerEmail,
          customer_name: customerName,
          shipping_address: body.shippingAddress ?? fallbackOrder.shipping_address,
          subtotal_usd: subtotalUsd,
          discount_usd: discountUsd,
          shipping_usd: shippingUsd,
          total_usd: totalUsd,
          currency,
        },
      });
    }

    const validUserId =
      body.userId && UUID_REGEX.test(body.userId) ? body.userId : null;

    // 1. Insert master order row into `public.orders`
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: validUserId,
        customer_email: customerEmail,
        customer_name: customerName,
        shipping_address: body.shippingAddress ?? {},
        subtotal_usd: subtotalUsd,
        discount_usd: discountUsd,
        shipping_usd: shippingUsd,
        total_usd: totalUsd,
        currency,
        status: "processing",
        payment_intent_id: paymentIntentId,
      })
      .select("*")
      .single();

    if (orderError || !orderRow) {
      return NextResponse.json(
        {
          success: false,
          error: orderError?.message ?? "Failed to create order record in Supabase.",
        },
        { status: 500 },
      );
    }

    const orderId = String((orderRow as Record<string, unknown>).id);

    // 2. Insert all purchased line items into `public.order_items`
    const orderItemPayloads = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      variant_id:
        item.variantId && UUID_REGEX.test(item.variantId) ? item.variantId : null,
      product_title: item.title,
      variant_name: item.variantName ?? null,
      quantity: Math.max(1, Number(item.quantity) || 1),
      unit_price_usd: Math.max(0, Number(item.unitPriceUsd) || 0),
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemPayloads)
      .select("*");

    if (itemsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Order created (${orderNumber}), but order_items failed: ${itemsError.message}`,
        },
        { status: 500 },
      );
    }

    const completeOrder = normalizeOrderRow({
      ...(orderRow as Record<string, unknown>),
      order_items: (insertedItems ?? []) as Record<string, unknown>[],
    });

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      paymentMode:
        process.env.STRIPE_SECRET_KEY || process.env.LEMONSQUEEZY_API_KEY
          ? "live-gateway"
          : "instant-supabase-sandbox",
      order: completeOrder,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unexpected checkout error.",
      },
      { status: 500 },
    );
  }
}
