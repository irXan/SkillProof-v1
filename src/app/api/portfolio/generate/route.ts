import { NextResponse } from "next/server";
import { portfolioGenerateSchema } from "@/lib/validation";
import { generatePortfolioDraft } from "@/lib/ai/generate";
import { AiGenerationError } from "@/lib/ai/generate";
import { isAiConfigured } from "@/lib/env";
import { buildDemoPortfolio } from "@/lib/demo";
import type { PortfolioDraftData } from "@/lib/ai/schemas";
import type { PortfolioGenerateRequest } from "@/lib/validation";
import type { Portfolio } from "@/types";
import {
  DEFAULT_SECTIONS,
  newProjectId,
  splitTools,
} from "@/lib/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PortfolioPayload = Omit<Portfolio, "id" | "slug" | "editToken" | "userId">;

/** Merges the AI's content with the user's real ids/links so nothing invented survives. */
function mergeDraft(
  data: PortfolioDraftData,
  input: PortfolioGenerateRequest,
): PortfolioPayload {
  const projects = data.projects.slice(0, input.projects.length).map((aiProject, index) => {
    const source = input.projects[index];
    const tools = aiProject.tools && aiProject.tools.length > 0
      ? aiProject.tools
      : splitTools(source?.tools);
    return {
      id: source?.id ?? newProjectId(),
      title: aiProject.title || source?.title || `Project ${index + 1}`,
      clientType: aiProject.clientType ?? "",
      problem: aiProject.problem ?? source?.problem ?? "",
      approach: aiProject.approach ?? source?.description ?? "",
      outcome: aiProject.outcome ?? source?.result ?? "",
      tools,
      projectUrl: "",
      githubUrl: source?.link ?? "",
      imageUrl: "",
      displayOrder: index,
      isFeatured: index === 0,
    };
  });

  return {
    fullName: input.profile.fullName,
    headline: data.headline,
    bio: data.bio,
    profileImageUrl: "",
    location: "",
    email: "",
    githubUrl: input.profile.githubUrl ?? "",
    linkedinUrl: "",
    websiteUrl: input.profile.portfolioUrl ?? "",
    resumeUrl: "",
    skills: data.skills,
    services: data.services,
    contactCta: data.contactCta,
    theme: "aurora",
    isPublished: false,
    projects,
    sections: DEFAULT_SECTIONS.map((section) => ({ ...section })),
  };
}

/**
 * POST /api/portfolio/generate
 * Returns a structured, editable portfolio draft. Falls back to a labelled
 * Demo Mode portfolio when AI is not configured.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON.", code: "BAD_JSON" },
      { status: 400 },
    );
  }

  const parsed = portfolioGenerateSchema.safeParse(body);
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

  const input = parsed.data;

  // Demo Mode: no key configured → return an honest sample portfolio.
  if (!isAiConfigured()) {
    const draftLike = {
      fullName: input.profile.fullName,
      skill: input.profile.skill,
      githubUrl: input.profile.githubUrl,
      portfolioUrl: input.profile.portfolioUrl,
      projects: input.projects.map((project) => ({
        id: project.id,
        title: project.title,
        tools: project.tools,
        description: project.description,
        problem: project.problem,
        result: project.result,
        link: project.link,
      })),
    };
    return NextResponse.json(
      { portfolio: buildDemoPortfolio(draftLike), demo: true, model: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { data, model } = await generatePortfolioDraft(input);
    return NextResponse.json(
      { portfolio: mergeDraft(data, input), demo: false, model },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message =
      error instanceof AiGenerationError
        ? error.message
        : "Something went wrong while generating your portfolio. Please try again.";
    const status = error instanceof AiGenerationError ? 502 : 500;
    console.error("[/api/portfolio/generate] failed:", error);
    return NextResponse.json({ error: message, code: "AI_FAILED" }, { status });
  }
}
