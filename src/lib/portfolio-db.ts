import { DEFAULT_SECTIONS, sortProjects } from "@/lib/portfolio";
import type {
  Portfolio,
  PortfolioProject,
  PortfolioSection,
  PortfolioService,
  PortfolioTheme,
} from "@/types";

/**
 * Pure mapping between the app's camelCase `Portfolio` shape and the
 * snake_case Postgres rows. Isomorphic (no server imports) so it can be used
 * by both server actions and the public page loader.
 */

export interface PortfolioRow {
  id: string;
  user_id: string | null;
  edit_token: string;
  slug: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  profile_image_url: string | null;
  location: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  resume_url: string | null;
  skills: unknown;
  services: unknown;
  contact_cta: string | null;
  theme: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioProjectRow {
  id: string;
  portfolio_id: string;
  title: string;
  client_type: string | null;
  problem: string | null;
  approach: string | null;
  outcome: string | null;
  tools: unknown;
  project_url: string | null;
  github_url: string | null;
  image_url: string | null;
  display_order: number;
  is_featured: boolean;
}

export interface PortfolioSectionRow {
  id: string;
  portfolio_id: string;
  section_key: string;
  title: string | null;
  content: unknown;
  display_order: number;
  is_visible: boolean;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

function asServices(value: unknown): PortfolioService[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        title: typeof record?.title === "string" ? record.title : "",
        description:
          typeof record?.description === "string" ? record.description : "",
      };
    })
    .filter((service) => service.title || service.description);
}

const THEMES: PortfolioTheme[] = ["aurora", "minimal", "bold"];

function asTheme(value: string | null): PortfolioTheme {
  return THEMES.includes(value as PortfolioTheme)
    ? (value as PortfolioTheme)
    : "aurora";
}

/** portfolio + children → app Portfolio object. */
export function rowsToPortfolio(
  row: PortfolioRow,
  projectRows: PortfolioProjectRow[],
  sectionRows: PortfolioSectionRow[],
): Portfolio {
  const projects: PortfolioProject[] = sortProjects(
    projectRows.map((project) => ({
      id: project.id,
      title: project.title,
      clientType: project.client_type ?? "",
      problem: project.problem ?? "",
      approach: project.approach ?? "",
      outcome: project.outcome ?? "",
      tools: asStringArray(project.tools),
      projectUrl: project.project_url ?? "",
      githubUrl: project.github_url ?? "",
      imageUrl: project.image_url ?? "",
      displayOrder: project.display_order,
      isFeatured: project.is_featured,
    })),
  );

  const sections: PortfolioSection[] =
    sectionRows.length > 0
      ? [...sectionRows]
          .sort((a, b) => a.display_order - b.display_order)
          .map((section) => ({
            key: section.section_key,
            title: section.title ?? section.section_key,
            isVisible: section.is_visible,
          }))
      : DEFAULT_SECTIONS.map((section) => ({ ...section }));

  return {
    id: row.id,
    slug: row.slug,
    editToken: row.edit_token,
    userId: row.user_id,
    fullName: row.full_name,
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    profileImageUrl: row.profile_image_url ?? "",
    location: row.location ?? "",
    email: row.email ?? "",
    githubUrl: row.github_url ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    websiteUrl: row.website_url ?? "",
    resumeUrl: row.resume_url ?? "",
    skills: asStringArray(row.skills),
    services: asServices(row.services),
    contactCta: row.contact_cta ?? "",
    theme: asTheme(row.theme),
    isPublished: row.is_published,
    projects,
    sections,
  };
}

/** app Portfolio → portfolios table row (without generated columns). */
export function portfolioToRow(
  portfolio: Portfolio,
  slug: string,
): Omit<PortfolioRow, "edit_token" | "created_at" | "updated_at"> {
  return {
    id: portfolio.id ?? "",
    user_id: portfolio.userId ?? null,
    slug,
    full_name: portfolio.fullName,
    headline: portfolio.headline,
    bio: portfolio.bio,
    profile_image_url: portfolio.profileImageUrl || null,
    location: portfolio.location || null,
    email: portfolio.email || null,
    github_url: portfolio.githubUrl || null,
    linkedin_url: portfolio.linkedinUrl || null,
    website_url: portfolio.websiteUrl || null,
    resume_url: portfolio.resumeUrl || null,
    skills: portfolio.skills,
    services: portfolio.services,
    contact_cta: portfolio.contactCta || null,
    theme: portfolio.theme,
    is_published: portfolio.isPublished,
  };
}

export function projectToRow(
  project: PortfolioProject,
  portfolioId: string,
): Omit<PortfolioProjectRow, "id"> & { id?: string } {
  const row = {
    portfolio_id: portfolioId,
    title: project.title || "Untitled project",
    client_type: project.clientType || null,
    problem: project.problem || null,
    approach: project.approach || null,
    outcome: project.outcome || null,
    tools: project.tools,
    project_url: project.projectUrl || null,
    github_url: project.githubUrl || null,
    image_url: project.imageUrl || null,
    display_order: project.displayOrder,
    is_featured: project.isFeatured,
  };
  // Only reuse an existing DB uuid; client ids (p_xxx) are replaced by the DB.
  if (/^[0-9a-f-]{36}$/i.test(project.id)) {
    return { id: project.id, ...row };
  }
  return row;
}

export function sectionToRow(
  section: PortfolioSection,
  portfolioId: string,
  index: number,
): Omit<PortfolioSectionRow, "id"> {
  return {
    portfolio_id: portfolioId,
    section_key: section.key,
    title: section.title,
    content: {},
    display_order: index,
    is_visible: section.isVisible,
  };
}
