import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "./env";

/**
 * Request-scoped Server Component / Server Action / Route Handler client bound
 * to the user's auth cookies. Reading cookies makes the caller dynamic — use it
 * for user-specific data (profiles, orders). Returns `null` when unconfigured.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — cookies are read-only there.
          // Session refresh is handled by middleware/proxy in a later phase.
        }
      },
    },
  });
}

/**
 * Cookie-less client for public catalog reads (anon role, RLS-enforced).
 * Safe inside `"use cache"` scopes because it never touches request data.
 */
export function createPublicClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  return createSupabaseClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
