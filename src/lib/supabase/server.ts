import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

/**
 * Server-side Supabase client bound to the request cookies.
 * Returns `null` when Supabase is not configured.
 */
export function createServerSupabase(): SupabaseClient | null {
  const { supabaseUrl, supabaseAnonKey } = getEnv();
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — safe to ignore, middleware
          // refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Admin client using the service role key. Used only by trusted server code
 * (e.g. the optional save action) to bypass RLS for anonymous demo rows.
 * Returns `null` when the key is not configured.
 */
export function createAdminSupabase(): SupabaseClient | null {
  const { supabaseUrl, supabaseServiceRoleKey } = getEnv();
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;

  // Uses the service role key; kept server-side only.
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
