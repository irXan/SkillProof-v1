import { createServerSupabase } from "@/lib/supabase/server";
import {
  rowsToPortfolio,
  type PortfolioProjectRow,
  type PortfolioRow,
  type PortfolioSectionRow,
} from "@/lib/portfolio-db";
import type { Portfolio } from "@/types";

/**
 * Loads a published portfolio (and its children) by slug.
 * Uses the anon key, so RLS guarantees only published rows are returned.
 * Returns null when Supabase is unconfigured or the portfolio is missing or
 * unpublished.
 */
export async function getPublishedPortfolio(
  slug: string,
): Promise<Portfolio | null> {
  const supabase = createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  const row = (data as PortfolioRow | null) ?? null;
  if (!row) return null;

  const [{ data: projectRows }, { data: sectionRows }] = await Promise.all([
    supabase
      .from("portfolio_projects")
      .select("*")
      .eq("portfolio_id", row.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("portfolio_sections")
      .select("*")
      .eq("portfolio_id", row.id)
      .order("display_order", { ascending: true }),
  ]);

  return rowsToPortfolio(
    row,
    (projectRows as PortfolioProjectRow[] | null) ?? [],
    (sectionRows as PortfolioSectionRow[] | null) ?? [],
  );
}
