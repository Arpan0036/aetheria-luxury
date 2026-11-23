"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | null | undefined;

/**
 * Browser Supabase client (singleton). Returns `null` when credentials are not
 * configured so UI code can fall back gracefully instead of crashing.
 */
export function createClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;
  const env = getSupabasePublicEnv();
  browserClient = env ? createBrowserClient(env.url, env.key) : null;
  return browserClient;
}
