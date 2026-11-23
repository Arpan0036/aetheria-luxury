"use server";

import { validateDiscountCode } from "@/lib/supabase/queries";
import type { DiscountValidation } from "@/types/database";

/** Server Action wrapper so client widgets can validate codes against the data layer. */
export async function validateDiscountAction(code: string, subtotalUsd: number): Promise<DiscountValidation> {
  if (typeof code !== "string" || typeof subtotalUsd !== "number") {
    return { valid: false, code: "", reason: "empty", message: "Invalid request.", mode: "local-fallback" };
  }
  return validateDiscountCode(code, subtotalUsd);
}
