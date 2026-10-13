/**
 * Centralised environment access.
 *
 * Nothing here throws. Every helper returns a status so the UI can show a
 * friendly message ("add your API key to enable generation") instead of
 * crashing when the app is deployed without secrets configured.
 */

export interface EnvConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  aiApiKey?: string;
  aiBaseUrl?: string;
  aiModel?: string;
}

export function getEnv(): EnvConfig {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    aiApiKey: process.env.AI_API_KEY,
    aiBaseUrl: process.env.AI_BASE_URL,
    aiModel: process.env.AI_MODEL,
  };
}

/** True when both public Supabase keys are present. */
export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getEnv();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** True when the AI provider is fully configured. */
export function isAiConfigured(): boolean {
  const { aiApiKey } = getEnv();
  return Boolean(aiApiKey);
}

export interface AiRuntimeConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

/**
 * Returns a validated AI config or a human-readable reason it is missing.
 * Used by the API route to fail gracefully.
 */
export function getAiRuntimeConfig():
  | { ok: true; config: AiRuntimeConfig }
  | { ok: false; reason: string } {
  const { aiApiKey, aiBaseUrl, aiModel } = getEnv();

  if (!aiApiKey) {
    return {
      ok: false,
      reason:
        "AI_API_KEY is not set. Add it to .env.local to enable AI generation.",
    };
  }

  return {
    ok: true,
    config: {
      apiKey: aiApiKey,
      baseURL: aiBaseUrl?.trim() || "https://api.openai.com/v1",
      model: aiModel?.trim() || "gpt-4o-mini",
    },
  };
}
