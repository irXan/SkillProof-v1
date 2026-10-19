import { randomSuffix, slugify } from "@/lib/utils";
import type {
  Portfolio,
  PortfolioProject,
  PortfolioSection,
  PortfolioTheme,
} from "@/types";

/**
 * Portfolio helpers shared by the client editor and the server actions.
 * Everything here is pure and isomorphic (no Node-only imports) so the same
 * functions can run in the browser and in server actions.
 */

/** The sections every portfolio starts with, in default display order. */
export const DEFAULT_SECTIONS: PortfolioSection[] = [
  { key: "about", title: "About", isVisible: true },
  { key: "skills", title: "Skills", isVisible: true },
  { key: "services", title: "Services", isVisible: true },
  { key: "projects", title: "Projects", isVisible: true },
  { key: "contact", title: "Contact", isVisible: true },
];

export const THEME_META: Record<
  PortfolioTheme,
  { label: string; description: string }
> = {
  aurora: {
    label: "Aurora",
    description: "Modern dark theme — best for developers.",
  },
  minimal: {
    label: "Minimal",
    description: "Clean light theme — best for general freelancers.",
  },
  bold: {
    label: "Bold",
    description: "High-contrast creative theme — best for designers & marketers.",
  },
};

/** Splits a "Python, OS, Pandas" style string into a clean tool list. */
export function splitTools(tools: string | string[] | undefined): string[] {
  if (Array.isArray(tools)) {
    return tools.map((tool) => tool.trim()).filter(Boolean);
  }
  return (tools ?? "")
    .split(/[,/|]+/)
    .map((tool) => tool.trim())
    .filter(Boolean);
}

/** Builds a unique-ish slug from a display name. */
export function buildSlug(fullName: string): string {
  const base = slugify(fullName) || "portfolio";
  return `${base}-${randomSuffix()}`;
}

/** A stable client-side id for a new project. */
export function newProjectId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}`;
}

/** An empty project slot with sensible defaults. */
export function emptyProject(displayOrder: number): PortfolioProject {
  return {
    id: newProjectId(),
    title: "",
    clientType: "",
    problem: "",
    approach: "",
    outcome: "",
    tools: [],
    projectUrl: "",
    githubUrl: "",
    imageUrl: "",
    displayOrder,
    isFeatured: false,
  };
}

/**
 * Creates an empty portfolio for a given name. Used as the shape the AI fills
 * in and as the fallback when generation is unavailable.
 */
export function createEmptyPortfolio(fullName = ""): Portfolio {
  return {
    fullName: fullName || "Your Name",
    headline: "",
    bio: "",
    profileImageUrl: "",
    location: "",
    email: "",
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    resumeUrl: "",
    skills: [],
    services: [],
    contactCta: "",
    theme: "aurora",
    isPublished: false,
    projects: [],
    sections: DEFAULT_SECTIONS.map((section) => ({ ...section })),
  };
}

/** Re-sorts projects by display_order and re-indexes them densely. */
export function sortProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return [...projects]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((project, index) => ({ ...project, displayOrder: index }));
}

/** Re-orders a list by moving one item from `from` to `to`. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
