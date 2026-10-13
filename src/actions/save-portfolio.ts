"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation";
import type { Generations } from "@/types";

export interface SaveResult {
  ok: boolean;
  error?: string;
  requiresAuth?: boolean;
  profileId?: string;
}

interface SavePortfolioInput {
  draft: unknown;
  generations: Generations;
}

/**
 * Optional: persists the current draft + generations to Supabase for the
 * signed-in user. This never blocks the demo flow — if Supabase is not
 * configured, or the visitor is anonymous, we return a friendly message.
 */
export async function savePortfolio({
  draft,
  generations,
}: SavePortfolioInput): Promise<SaveResult> {
  const supabase = createServerSupabase();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured, so saving is disabled.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      requiresAuth: true,
      error: "Sign in to save this portfolio to your account.",
    };
  }

  const parsed = onboardingSchema.safeParse(draft);
  if (!parsed.success) {
    return { ok: false, error: "Your portfolio details are incomplete." };
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        full_name: parsed.data.fullName,
        skill: parsed.data.skill,
        github_url: parsed.data.githubUrl ?? null,
        portfolio_url: parsed.data.portfolioUrl ?? null,
      })
      .select("id")
      .single();

    if (profileError || !profile) {
      throw profileError ?? new Error("Could not create profile");
    }

    const profileId = profile.id as string;

    const projectRows = parsed.data.projects.map((project) => ({
      profile_id: profileId,
      title: project.title,
      tools: project.tools,
      description: project.description,
      problem: project.problem,
      result: project.result,
      link: project.link ?? null,
    }));

    const { error: projectsError } = await supabase
      .from("projects")
      .insert(projectRows);
    if (projectsError) throw projectsError;

    const generationRows = Object.entries(generations)
      .filter(([, content]) => Boolean(content))
      .map(([type, content]) => ({
        profile_id: profileId,
        type,
        content: content as string,
      }));

    if (generationRows.length > 0) {
      const { error: generationsError } = await supabase
        .from("generations")
        .insert(generationRows);
      if (generationsError) throw generationsError;
    }

    revalidatePath("/portfolio");
    return { ok: true, profileId };
  } catch (error) {
    console.error("[savePortfolio] failed:", error);
    const message =
      error instanceof Error ? error.message : "Could not save your portfolio.";
    return { ok: false, error: message };
  }
}
