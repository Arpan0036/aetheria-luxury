"use server";

import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

const VALID_STATUSES = new Set<OrderStatus>([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export async function updateOrderStatusAction(
  orderId: string,
  orderNumber: string,
  nextStatus: OrderStatus,
): Promise<{ ok: boolean; status: OrderStatus; updatedAt: string; error?: string }> {
  if (!VALID_STATUSES.has(nextStatus)) {
    return {
      ok: false,
      status: "processing",
      updatedAt: new Date().toISOString(),
      error: "Invalid status value.",
    };
  }

  const supabase = createPublicClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId)
        .select("status, updated_at")
        .maybeSingle();

      if (!error && data) {
        revalidatePath(`/order/${orderId}`);
        revalidatePath(`/order/${orderNumber}`);
        return {
          ok: true,
          status: (data.status as OrderStatus) ?? nextStatus,
          updatedAt: String(data.updated_at ?? new Date().toISOString()),
        };
      }
      if (error) {
        return {
          ok: false,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          error: error.message,
        };
      }
    } catch (err) {
      return {
        ok: false,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Failed to update status",
      };
    }
  }

  return {
    ok: true,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
}
