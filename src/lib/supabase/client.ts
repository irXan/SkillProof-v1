"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

/**
 * Browser Supabase client. Returns `null` when Supabase env vars are absent so
 * that demo mode keeps working without any backend configuration.
 */
export function createClient(): SupabaseClient | null {
  const { supabaseUrl, supabaseAnonKey } = getEnv();
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
