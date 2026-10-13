import { NextResponse } from "next/server";
import { generateRequestSchema } from "@/lib/validation";
import { AiGenerationError, generateContent } from "@/lib/ai/generate";
import { isAiConfigured, getEnv } from "@/lib/env";

// The OpenAI-compatible SDK needs the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate
 * Body: GenerateRequest (see src/lib/validation.ts)
 * Response: { content: string, questions?: InterviewQuestion[], model: string }
 */
export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Add AI_API_KEY (and AI_BASE_URL / AI_MODEL) to your environment and restart the server.",
        code: "AI_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON.", code: "BAD_JSON" },
      { status: 400 },
    );
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some required details are missing or invalid.",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await generateContent(parsed.data);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof AiGenerationError
        ? error.message
        : "Something went wrong while generating. Please try again.";
    const status = error instanceof AiGenerationError ? 502 : 500;
    console.error("[/api/generate] generation failed:", error);
    return NextResponse.json({ error: message, code: "AI_FAILED" }, { status });
  }
}

/** Small helper for the UI to know whether generation is available. */
export async function GET() {
  const { aiModel } = getEnv();
  return NextResponse.json({
    configured: isAiConfigured(),
    model: aiModel?.trim() || null,
  });
}
