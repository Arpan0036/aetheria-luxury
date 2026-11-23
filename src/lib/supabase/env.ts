/**
 * Supabase environment resolution. Both the legacy anon key and the newer
 * publishable key (`sb_publishable_…`) are accepted. The service-role key is
 * never read here — it must stay server-only and is not needed for catalog reads.
 */
export interface SupabasePublicEnv {
  url: string;
  key: string;
}

const PLACEHOLDER = /your-project|your_|<|xxxx|example/i;

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !key || PLACEHOLDER.test(url) || PLACEHOLDER.test(key)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  } catch {
    return null;
  }
  return { url, key };
}

export const isSupabaseConfigured = () => getSupabasePublicEnv() !== null;
