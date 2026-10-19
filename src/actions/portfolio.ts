"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { buildSlug } from "@/lib/portfolio";
import { randomSuffix } from "@/lib/utils";
import {
  projectToRow,
  rowsToPortfolio,
  sectionToRow,
  portfolioToRow,
  type PortfolioProjectRow,
  type PortfolioRow,
  type PortfolioSectionRow,
} from "@/lib/portfolio-db";
import type { Portfolio } from "@/types";

export interface SavePortfolioResult {
  ok: boolean;
  id?: string;
  slug?: string;
  editToken?: string;
  isPublished?: boolean;
  error?: string;
}

interface SavePortfolioInput {
  portfolio: Portfolio;
  /** Required for guest (not signed-in) updates. */
  editToken?: string;
}

const UUID_RE = /^[0-9a-f-]{36}$/i;

/** Ensures a slug is unique, excluding the row being updated. */
async function uniqueSlug(
  client: SupabaseClient,
  desired: string,
  excludeId?: string,
): Promise<string> {
  let candidate = desired;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await client
      .from("portfolios")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    candidate = `${desired}-${randomSuffix()}`;
  }
  return `${desired}-${Date.now().toString(36)}`;
}

/**
 * Creates or updates a portfolio. Owners write through RLS; guests write
 * through the service role and must present the matching `edit_token`.
 */
export async function savePortfolioSite({
  portfolio,
  editToken,
}: SavePortfolioInput): Promise<SavePortfolioResult> {
  const userClient = createServerSupabase();
  const admin = createAdminSupabase();

  if (!userClient && !admin) {
    return {
      ok: false,
      error:
        "Publishing needs Supabase. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.",
    };
  }

  const user = userClient ? (await userClient.auth.getUser()).data.user : null;

  // Decide which client to write with: signed-in users use RLS; guests use the
  // service role so they can publish without an account.
  const writer = user && userClient ? userClient : admin;
  if (!writer) {
    return { ok: false, error: "Publishing is not available right now." };
  }

  const isUpdate = Boolean(portfolio.id && UUID_RE.test(portfolio.id));

  // Guests may only update rows they hold the token for.
  let existing: PortfolioRow | null = null;
  if (isUpdate && portfolio.id) {
    const { data } = await writer
      .from("portfolios")
      .select("*")
      .eq("id", portfolio.id)
      .maybeSingle();
    existing = (data as PortfolioRow | null) ?? null;

    if (!existing) {
      return { ok: false, error: "This portfolio no longer exists." };
    }
    if (user) {
      if (existing.user_id !== user.id) {
        return { ok: false, error: "You do not have access to this portfolio." };
      }
    } else if (!editToken || existing.edit_token !== editToken) {
      return { ok: false, error: "You do not have permission to edit this portfolio." };
    }
  }

  try {
    const slug = await uniqueSlug(
      writer,
      existing?.slug ?? buildSlug(portfolio.fullName),
      existing?.id,
    );

    const parent = {
      ...portfolioToRow({ ...portfolio, userId: user?.id ?? existing?.user_id ?? null }, slug),
      is_published: portfolio.isPublished || existing?.is_published || false,
    };
    delete (parent as { id?: string }).id;

    let portfolioId: string;

    if (existing) {
      const { data, error } = await writer
        .from("portfolios")
        .update(parent)
        .eq("id", existing.id)
        .select("id, slug, edit_token, is_published")
        .single();
      if (error || !data) throw error ?? new Error("Update failed");
      portfolioId = data.id as string;
      existing = { ...existing, slug: data.slug, is_published: data.is_published };
    } else {
      const { data, error } = await writer
        .from("portfolios")
        .insert(parent)
        .select("id, slug, edit_token, is_published")
        .single();
      if (error || !data) throw error ?? new Error("Insert failed");
      portfolioId = data.id as string;
      existing = {
        ...(parent as unknown as PortfolioRow),
        id: data.id,
        slug: data.slug,
        edit_token: data.edit_token,
        is_published: data.is_published,
      };
    }

    // Replace children (simple and predictable for this MVP).
    await writer.from("portfolio_projects").delete().eq("portfolio_id", portfolioId);
    await writer.from("portfolio_sections").delete().eq("portfolio_id", portfolioId);

    if (portfolio.projects.length > 0) {
      const { error } = await writer
        .from("portfolio_projects")
        .insert(portfolio.projects.map((project) => projectToRow(project, portfolioId)));
      if (error) throw error;
    }

    if (portfolio.sections.length > 0) {
      const { error } = await writer
        .from("portfolio_sections")
        .insert(portfolio.sections.map((section, index) => sectionToRow(section, portfolioId, index)));
      if (error) throw error;
    }

    revalidatePath("/dashboard");
    revalidatePath("/p/" + existing.slug);

    return {
      ok: true,
      id: portfolioId,
      slug: existing.slug,
      editToken: existing.edit_token,
      isPublished: existing.is_published,
    };
  } catch (error) {
    console.error("[savePortfolioSite] failed:", error);
    const message =
      error instanceof Error ? error.message : "Could not save your portfolio.";
    return { ok: false, error: message };
  }
}

export interface LoadPortfolioResult {
  ok: boolean;
  portfolio?: Portfolio;
  error?: string;
}

/**
 * Loads a portfolio (with children) for editing. Owners are resolved through
 * RLS; guests must present the matching `edit_token`.
 */
export async function loadPortfolioForEdit(
  id: string,
  editToken?: string,
): Promise<LoadPortfolioResult> {
  if (!UUID_RE.test(id)) {
    return { ok: false, error: "Invalid portfolio id." };
  }

  const userClient = createServerSupabase();
  const admin = createAdminSupabase();

  let row: PortfolioRow | null = null;
  let reader = userClient;

  if (userClient) {
    const { data } = await userClient
      .from("portfolios")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    row = (data as PortfolioRow | null) ?? null;
  }

  if (!row && admin && editToken) {
    const { data } = await admin
      .from("portfolios")
      .select("*")
      .eq("id", id)
      .eq("edit_token", editToken)
      .maybeSingle();
    row = (data as PortfolioRow | null) ?? null;
    reader = admin;
  }

  if (!row || !reader) {
    return { ok: false, error: "Portfolio not found." };
  }

  const [{ data: projectRows }, { data: sectionRows }] = await Promise.all([
    reader.from("portfolio_projects").select("*").eq("portfolio_id", id),
    reader.from("portfolio_sections").select("*").eq("portfolio_id", id),
  ]);

  return {
    ok: true,
    portfolio: rowsToPortfolio(
      row,
      (projectRows as PortfolioProjectRow[] | null) ?? [],
      (sectionRows as PortfolioSectionRow[] | null) ?? [],
    ),
  };
}

/** Publishes or unpublishes a portfolio. */
export async function setPortfolioPublished(
  id: string,
  isPublished: boolean,
  editToken?: string,
): Promise<SavePortfolioResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid portfolio id." };

  const userClient = createServerSupabase();
  const admin = createAdminSupabase();
  const user = userClient ? (await userClient.auth.getUser()).data.user : null;
  const writer = user && userClient ? userClient : admin;
  if (!writer) return { ok: false, error: "Publishing is not available right now." };

  const { data: existing } = await writer
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const row = existing as PortfolioRow | null;
  if (!row) return { ok: false, error: "Portfolio not found." };

  if (user) {
    if (row.user_id !== user.id) return { ok: false, error: "Not your portfolio." };
  } else if (!editToken || row.edit_token !== editToken) {
    return { ok: false, error: "You do not have permission to edit this portfolio." };
  }

  const { error } = await writer
    .from("portfolios")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/p/" + row.slug);
  return { ok: true, id, slug: row.slug, editToken: row.edit_token, isPublished };
}

export interface PortfolioSummary {
  id: string;
  slug: string;
  fullName: string;
  headline: string;
  isPublished: boolean;
  updatedAt?: string;
}

/** Lists the signed-in user's portfolios (owner-only, via RLS). */
export async function listMyPortfolios(): Promise<PortfolioSummary[]> {
  const userClient = createServerSupabase();
  if (!userClient) return [];

  const user = (await userClient.auth.getUser()).data.user;
  if (!user) return [];

  const { data } = await userClient
    .from("portfolios")
    .select("id, slug, full_name, headline, is_published, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!data) return [];

  return (data as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    fullName: (row.full_name as string) ?? "Portfolio",
    headline: (row.headline as string) ?? "",
    isPublished: Boolean(row.is_published),
    updatedAt: (row.updated_at as string) ?? undefined,
  }));
}
