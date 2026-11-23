"use server";

import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import { normalizeOrderRow, SEED_ORDERS } from "@/lib/supabase/orders";
import type {
  CollectorProfile,
  CollectorRole,
  OrderRecord,
  OrderShippingAddress,
} from "@/types/database";

const DEMO_COLLECTOR_ID = "f0000000-0000-4000-8000-000000000001";
const DEMO_COLLECTOR_EMAIL = "julian.vance@aetheria.studio";

const DEFAULT_DEMO_PROFILE: CollectorProfile = {
  id: DEMO_COLLECTOR_ID,
  email: DEMO_COLLECTOR_EMAIL,
  full_name: "Julian Vance",
  role: "customer",
  default_shipping_address: {
    street: "412 Mercer St",
    apartment: "Penthouse B",
    city: "New York",
    state: "NY",
    postal_code: "10013",
    country: "United States",
    phone: "+1 (212) 555-0194",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

type Row = Record<string, unknown>;

function toCollectorProfile(r: Row): CollectorProfile {
  return {
    id: String(r.id),
    email: String(r.email ?? DEMO_COLLECTOR_EMAIL),
    full_name: String(r.full_name ?? "Julian Vance"),
    role: r.role === "admin" ? "admin" : "customer",
    default_shipping_address:
      (r.default_shipping_address as OrderShippingAddress | null) ?? null,
    created_at: String(r.created_at ?? new Date().toISOString()),
    updated_at: String(r.updated_at ?? new Date().toISOString()),
  };
}

export async function fetchCollectorDossierAction(params?: {
  userId?: string;
  email?: string;
  fullName?: string;
}): Promise<{
  profile: CollectorProfile;
  orders: OrderRecord[];
  mode: "supabase-live" | "local-fallback";
}> {
  const targetId = params?.userId?.trim() || DEMO_COLLECTOR_ID;
  const targetEmail = (params?.email?.trim() || DEMO_COLLECTOR_EMAIL).toLowerCase();

  const supabase = createPublicClient();
  if (!supabase) {
    return {
      profile: {
        ...DEFAULT_DEMO_PROFILE,
        id: targetId,
        email: targetEmail,
        full_name: params?.fullName?.trim() || DEFAULT_DEMO_PROFILE.full_name,
      },
      orders: SEED_ORDERS,
      mode: "local-fallback",
    };
  }

  try {
    // 1. Fetch profile by ID or email
    let { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetId)
      .maybeSingle();

    if (!profileRow && targetEmail) {
      const byEmail = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", targetEmail)
        .maybeSingle();
      profileRow = byEmail.data;
    }

    if (!profileRow) {
      const demoRes = await supabase
        .from("profiles")
        .select("*")
        .eq("id", DEMO_COLLECTOR_ID)
        .maybeSingle();
      profileRow = demoRes.data;
    }

    const profile: CollectorProfile = profileRow
      ? toCollectorProfile(profileRow as Row)
      : {
          ...DEFAULT_DEMO_PROFILE,
          email: targetEmail,
          full_name: params?.fullName?.trim() || DEFAULT_DEMO_PROFILE.full_name,
        };

    // If caller passed a brand-new custom name on Sign Up, sync it to profile
    if (
      params?.fullName &&
      params.fullName.trim().length >= 2 &&
      profileRow &&
      profile.full_name !== params.fullName.trim()
    ) {
      const { data: updated } = await supabase
        .from("profiles")
        .update({ full_name: params.fullName.trim() })
        .eq("id", profile.id)
        .select("*")
        .maybeSingle();
      if (updated) {
        Object.assign(profile, toCollectorProfile(updated as Row));
      }
    }

    // 2. Fetch orders matching user_id OR customer_email
    const { data: orderRows } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .or(`user_id.eq.${profile.id},customer_email.ilike.${profile.email}`)
      .order("created_at", { ascending: false });

    const orders: OrderRecord[] = Array.isArray(orderRows)
      ? orderRows.map((r) => normalizeOrderRow(r as Row & { order_items?: Row[] }))
      : [];

    return {
      profile,
      orders,
      mode: "supabase-live",
    };
  } catch {
    return {
      profile: DEFAULT_DEMO_PROFILE,
      orders: [],
      mode: "local-fallback",
    };
  }
}

export async function toggleCollectorRoleAction(
  profileId: string,
  nextRole: CollectorRole,
): Promise<{
  ok: boolean;
  profile?: CollectorProfile;
  error?: string;
}> {
  const role: CollectorRole = nextRole === "admin" ? "admin" : "customer";
  const supabase = createPublicClient();
  if (!supabase) {
    return {
      ok: true,
      profile: { ...DEFAULT_DEMO_PROFILE, id: profileId, role },
    };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", profileId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "Failed to update role in public.profiles.",
      };
    }

    revalidatePath("/account");
    return {
      ok: true,
      profile: toCollectorProfile(data as Row),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unexpected error updating role.",
    };
  }
}

export async function updateCollectorProfileAction(input: {
  profileId: string;
  fullName: string;
  defaultShippingAddress: OrderShippingAddress;
}): Promise<{
  ok: boolean;
  profile?: CollectorProfile;
  error?: string;
}> {
  const fullName = input.fullName.trim() || "Julian Vance";
  const supabase = createPublicClient();
  if (!supabase) {
    return {
      ok: true,
      profile: {
        ...DEFAULT_DEMO_PROFILE,
        id: input.profileId,
        full_name: fullName,
        default_shipping_address: input.defaultShippingAddress,
      },
    };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        default_shipping_address: input.defaultShippingAddress,
      })
      .eq("id", input.profileId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "Failed to update profile in Supabase.",
      };
    }

    revalidatePath("/account");
    revalidatePath("/checkout");
    return {
      ok: true,
      profile: toCollectorProfile(data as Row),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unexpected error saving dossier.",
    };
  }
}
