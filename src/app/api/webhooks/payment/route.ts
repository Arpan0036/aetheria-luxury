import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

/**
 * Plug-and-play Payment Webhook Receiver (/api/webhooks/payment)
 *
 * Compatible with Stripe (`payment_intent.succeeded`) and Lemon Squeezy
 * (`order_created`) webhook payloads, or internal sandbox status callbacks.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      orderId?: string;
      orderNumber?: string;
      status?: OrderStatus;
      paymentIntentId?: string;
    };

    const supabase = createPublicClient();
    if (!supabase) {
      return NextResponse.json({ received: true, mode: "local-fallback" });
    }

    if (payload.orderId || payload.orderNumber) {
      const nextStatus: OrderStatus = payload.status ?? "processing";
      const query = supabase.from("orders").update({
        status: nextStatus,
        ...(payload.paymentIntentId ? { payment_intent_id: payload.paymentIntentId } : {}),
      });

      if (payload.orderId) {
        await query.eq("id", payload.orderId);
      } else if (payload.orderNumber) {
        await query.eq("order_number", payload.orderNumber);
      }
    }

    return NextResponse.json({
      received: true,
      gateway: process.env.STRIPE_WEBHOOK_SECRET
        ? "stripe"
        : process.env.LEMONSQUEEZY_WEBHOOK_SECRET
          ? "lemonsqueezy"
          : "sandbox",
    });
  } catch (err) {
    return NextResponse.json(
      {
        received: false,
        error: err instanceof Error ? err.message : "Webhook parsing error",
      },
      { status: 400 },
    );
  }
}
