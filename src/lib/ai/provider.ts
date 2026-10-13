import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getAiRuntimeConfig } from "@/lib/env";

export interface ResolvedModel {
  model: LanguageModel;
  modelId: string;
  baseURL: string;
}

export type ModelResult =
  | { ok: true; resolved: ResolvedModel }
  | { ok: false; reason: string };

/**
 * Builds an AI SDK language model from environment configuration.
 *
 * We intentionally use the OpenAI-compatible **chat** endpoint
 * (`provider.chat(...)`) rather than the newer Responses API, because the
 * majority of OpenAI-compatible providers (Groq, Together, OpenRouter, local
 * vLLM, etc.) implement `/chat/completions`.
 *
 * Returns a discriminated result so callers can surface a friendly error
 * instead of throwing when configuration is missing.
 */
export function resolveModel(): ModelResult {
  const runtime = getAiRuntimeConfig();
  if (!runtime.ok) {
    return { ok: false, reason: runtime.reason };
  }

  const { apiKey, baseURL, model } = runtime.config;
  const provider = createOpenAI({ apiKey, baseURL });

  return {
    ok: true,
    resolved: {
      model: provider.chat(model),
      modelId: model,
      baseURL,
    },
  };
}
