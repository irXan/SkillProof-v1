import { generateObject, generateText, type LanguageModel } from "ai";
import type { InterviewQuestion } from "@/types";
import type { GenerateRequest, PortfolioGenerateRequest } from "@/lib/validation";
import { resolveModel } from "@/lib/ai/provider";
import { SYSTEM_PROMPT, buildUserPrompt, buildPortfolioPrompt } from "@/lib/ai/prompts";
import { interviewSchema, portfolioDraftSchema, type PortfolioDraftData } from "@/lib/ai/schemas";

/** Hard ceiling on a single provider call so a hung request can't stall us. */
const AI_TIMEOUT_MS = 45_000;
/** Total attempts for one output (first try + one retry) before giving up. */
const MAX_ATTEMPTS = 2;

/** Thrown for any generation problem we want to show as a friendly message. */
export class AiGenerationError extends Error {
  /** True for transient failures that are worth one automatic retry. */
  readonly retryable: boolean;

  constructor(message: string, retryable = false) {
    super(message);
    this.name = "AiGenerationError";
    this.retryable = retryable;
  }
}

export interface GenerationResult {
  content: string;
  questions?: InterviewQuestion[];
  model: string;
}

/**
 * Generates one SkillProof output for the given request.
 *
 * - Four prose outputs use `generateText` (reliable across OpenAI-compatible
 *   providers) and return Markdown.
 * - Interview practice prefers structured JSON via `generateObject`, with a
 *   text-parsing fallback for providers that do not support JSON mode.
 *
 * Every call is given a hard timeout and one automatic retry on transient
 * failures (network, rate limit, timeout, empty/malformed response).
 */
export async function generateContent(
  input: GenerateRequest,
): Promise<GenerationResult> {
  const resolved = resolveModel();
  if (!resolved.ok) {
    throw new AiGenerationError(resolved.reason);
  }

  const { model, modelId } = resolved.resolved;
  const prompt = buildUserPrompt(input);

  let lastError: AiGenerationError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return input.type === "interview_questions"
        ? await generateInterviewQuestions(model, modelId, prompt)
        : await generateProse(model, modelId, prompt);
    } catch (error) {
      const friendly = toFriendlyError(error);
      lastError = friendly;
      if (!friendly.retryable || attempt === MAX_ATTEMPTS) {
        throw friendly;
      }
      await delay(700 * attempt);
    }
  }

  throw lastError ?? new AiGenerationError("AI generation failed. Please try again.");
}

export interface PortfolioDraftResult {
  data: PortfolioDraftData;
  model: string;
}

/**
 * Generates the single structured portfolio draft with `generateObject`.
 * Shares the same timeout / retry / friendly-error handling as prose outputs.
 */
export async function generatePortfolioDraft(
  input: PortfolioGenerateRequest,
): Promise<PortfolioDraftResult> {
  const resolved = resolveModel();
  if (!resolved.ok) {
    throw new AiGenerationError(resolved.reason);
  }

  const { model, modelId } = resolved.resolved;
  const prompt = buildPortfolioPrompt(input);

  let lastError: AiGenerationError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { object } = await withTimeout((signal) =>
        generateObject({
          model,
          system: SYSTEM_PROMPT,
          prompt,
          schema: portfolioDraftSchema,
          temperature: 0.6,
          maxTokens: 3000,
          abortSignal: signal,
        }),
      );
      return { data: object, model: modelId };
    } catch (error) {
      const friendly = toFriendlyError(error);
      lastError = friendly;
      if (!friendly.retryable || attempt === MAX_ATTEMPTS) {
        throw friendly;
      }
      await delay(700 * attempt);
    }
  }

  throw lastError ?? new AiGenerationError("AI generation failed. Please try again.");
}

async function generateProse(
  model: LanguageModel,
  modelId: string,
  prompt: string,
): Promise<GenerationResult> {
  try {
    const { text } = await withTimeout((signal) =>
      generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.6,
        maxTokens: 3000,
        abortSignal: signal,
      }),
    );

    const content = text.trim();
    if (!content) {
      throw new AiGenerationError(
        "The AI returned an empty response. Please try again.",
        true,
      );
    }
    return { content, model: modelId };
  } catch (error) {
    throw toFriendlyError(error);
  }
}

async function generateInterviewQuestions(
  model: LanguageModel,
  modelId: string,
  prompt: string,
): Promise<GenerationResult> {
  // Preferred path: structured output.
  try {
    const { object } = await withTimeout((signal) =>
      generateObject({
        model,
        system: SYSTEM_PROMPT,
        prompt,
        schema: interviewSchema,
        temperature: 0.5,
        maxTokens: 3000,
        abortSignal: signal,
      }),
    );

    const questions = normaliseQuestions(object.questions);
    if (questions.length > 0) {
      return {
        content: renderQuestions(questions),
        questions,
        model: modelId,
      };
    }
  } catch {
    // Fall through to the text-based fallback below.
  }

  // Fallback path for providers without JSON/tool support.
  try {
    const { text } = await withTimeout((signal) =>
      generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.5,
        maxTokens: 3000,
        abortSignal: signal,
      }),
    );

    const parsed = parseQuestionsFromText(text);
    if (parsed.length > 0) {
      return { content: renderQuestions(parsed), questions: parsed, model: modelId };
    }

    // Last resort: show whatever the model produced so the user isn't blocked.
    const content = text.trim();
    if (content) return { content, questions: [], model: modelId };
    throw new AiGenerationError(
      "The AI returned an empty response. Please try again.",
      true,
    );
  } catch (error) {
    throw toFriendlyError(error);
  }
}

function normaliseQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
  return questions
    .map((q) => ({ question: q.question.trim(), answer: q.answer.trim() }))
    .filter((q) => q.question && q.answer)
    .slice(0, 5);
}

/** Extracts a JSON payload from a model response, tolerating code fences. */
function parseQuestionsFromText(text: string): InterviewQuestion[] {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const candidates = [cleaned];
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(cleaned.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const json = JSON.parse(candidate);
      const raw = Array.isArray(json) ? json : json?.questions;
      if (Array.isArray(raw)) {
        const questions = normaliseQuestions(
          raw.map((item: unknown) => {
            const record = item as Record<string, unknown>;
            return {
              question: String(record?.question ?? ""),
              answer: String(record?.answer ?? ""),
            };
          }),
        );
        if (questions.length > 0) return questions;
      }
    } catch {
      /* try next candidate */
    }
  }
  return [];
}

/** Renders Q&A pairs as Markdown so they display consistently with other cards. */
function renderQuestions(questions: InterviewQuestion[]): string {
  return questions
    .map((q, index) => `### ${index + 1}. ${q.question}\n\n${q.answer}`)
    .join("\n\n");
}

/** Runs a provider call under an abort timer, always clearing the timer. */
async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Converts low-level provider errors into a clear, user-facing message. */
function toFriendlyError(error: unknown): AiGenerationError {
  if (error instanceof AiGenerationError) return error;

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("abort") ||
    lower.includes("timeout") ||
    lower.includes("timed out")
  ) {
    return new AiGenerationError(
      "The AI provider took too long to respond. Please try again.",
      true,
    );
  }
  if (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("unauthorized") ||
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key")
  ) {
    return new AiGenerationError(
      "The AI provider rejected the API key. Check AI_API_KEY in your environment.",
    );
  }
  if (lower.includes("404") || lower.includes("model not found") || lower.includes("does not exist")) {
    return new AiGenerationError(
      "The configured AI model was not found. Check AI_MODEL and AI_BASE_URL.",
    );
  }
  if (lower.includes("400") || lower.includes("bad request") || lower.includes("invalid")) {
    return new AiGenerationError(
      "The AI provider rejected the request. Check AI_MODEL supports this endpoint.",
    );
  }
  if (
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("overloaded") ||
    lower.includes("503") ||
    lower.includes("502") ||
    lower.includes("500")
  ) {
    return new AiGenerationError(
      "The AI provider is busy or rate limiting requests. Please try again in a moment.",
      true,
    );
  }
  if (
    lower.includes("fetch failed") ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("network") ||
    lower.includes("socket")
  ) {
    return new AiGenerationError(
      "Could not reach the AI provider. Check AI_BASE_URL and your network connection.",
      true,
    );
  }
  if (lower.includes("empty response")) {
    return new AiGenerationError(
      "The AI returned an empty response. Please try again.",
      true,
    );
  }

  return new AiGenerationError(
    "AI generation failed. Please try again. " + (message ? `(${message})` : ""),
  );
}
