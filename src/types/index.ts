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
}

export interface AiConfigStatus {
  configured: boolean;
  model?: string;
  message?: string;
}
