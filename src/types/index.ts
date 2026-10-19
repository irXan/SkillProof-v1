/**
 * Shared domain types for SkillProof.
 * These mirror the shape of the Supabase tables (profiles / projects /
 * generations) so the same objects can live in React state, localStorage, or
 * Postgres without translation.
 */

export const SKILLS = [
  "Python Development",
  "Web Development",
  "Graphic Design",
  "Video Editing",
  "UI/UX Design",
  "Digital Marketing",
  "Virtual Assistance",
  "Content Writing",
] as const;

export type Skill = (typeof SKILLS)[number];

/** The five AI outputs produced by the app. */
export const GENERATION_TYPES = [
  "case_study",
  "bio",
  "profile_summary",
  "proposal",
  "interview_questions",
] as const;

export type GenerationType = (typeof GENERATION_TYPES)[number];

/** A structured interview question/answer pair. */
export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface Project {
  /** Client-side id; becomes the DB row id after saving. */
  id: string;
  title: string;
  tools: string;
  description: string;
  problem: string;
  result: string;
  /** Optional GitHub / live demo link. */
  link?: string;
}

export interface ProfileDraft {
  fullName: string;
  skill: Skill;
  githubUrl?: string;
  portfolioUrl?: string;
  projects: Project[];
}

/** AI output keyed by generation type. Values are Markdown strings. */
export type Generations = Partial<Record<GenerationType, string>>;

/** How verbose generated copy should be. Maps to a prompt instruction only. */
export const OUTPUT_QUALITIES = ["concise", "balanced", "detailed"] as const;
export type OutputQuality = (typeof OUTPUT_QUALITIES)[number];

/** Full app state persisted to localStorage (demo + logged-in alike). */
export interface SkillProofState {
  userId?: string | null;
  draft: ProfileDraft;
  generations: Generations;
  /** Chosen output length preference. */
  quality?: OutputQuality;
  /** ISO timestamp of the last generation run, for display only. */
  generatedAt?: string;
  /** The editable / publishable portfolio (local draft until published). */
  portfolio?: Portfolio | null;
}

export interface AiConfigStatus {
  configured: boolean;
  model?: string;
  message?: string;
}

/* -------------------------------------------------------------------------- */
/* Live portfolio                                                             */
/* -------------------------------------------------------------------------- */

/** Visual themes available to a public portfolio. */
export const PORTFOLIO_THEMES = ["aurora", "minimal", "bold"] as const;
export type PortfolioTheme = (typeof PORTFOLIO_THEMES)[number];

/** A service the freelancer offers, shown in the Services section. */
export interface PortfolioService {
  title: string;
  description: string;
}

/** One case-study project inside a portfolio. */
export interface PortfolioProject {
  /** Client-side id; becomes the DB row id after publishing. */
  id: string;
  title: string;
  clientType?: string;
  problem?: string;
  approach?: string;
  outcome?: string;
  tools: string[];
  projectUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  displayOrder: number;
  isFeatured: boolean;
}

/** A toggleable / reorderable section of the portfolio page. */
export interface PortfolioSection {
  key: string;
  title: string;
  isVisible: boolean;
}

/**
 * A full editable portfolio. Everything needed to render `/p/[slug]` and to
 * save/publish to Postgres lives here.
 */
export interface Portfolio {
  /** DB id once saved/published. Undefined for a local draft. */
  id?: string;
  /** Public slug once published. */
  slug?: string;
  /** Guest edit secret, kept only in the browser and sent to server actions. */
  editToken?: string;
  /** null / undefined for guest portfolios. */
  userId?: string | null;
  fullName: string;
  headline: string;
  bio: string;
  profileImageUrl?: string;
  location?: string;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  resumeUrl?: string;
  skills: string[];
  services: PortfolioService[];
  contactCta?: string;
  theme: PortfolioTheme;
  isPublished: boolean;
  projects: PortfolioProject[];
  sections: PortfolioSection[];
}

/** Result returned by POST /api/portfolio/generate. */
export interface PortfolioGenerationResult {
  portfolio: Omit<Portfolio, "id" | "slug" | "editToken" | "userId">;
  model?: string;
  demo?: boolean;
}
