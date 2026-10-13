import type { GenerationType, OutputQuality, ProfileDraft, Project } from "@/types";
import { SKILLS } from "@/types";

/** localStorage key holding the whole demo/account draft. */
export const STORAGE_KEY = "skillproof:state:v1";

/**
 * Pre-filled demo data. Clicking "Use sample project" in onboarding loads this
 * so the full flow can be shown instantly without typing.
 */
export const SAMPLE_PROJECT: Project = {
  id: "sample-file-organizer",
  title: "File Organizer Automation Script",
  tools: "Python, OS, Pandas",
  description:
    "A Python script that organizes files into folders by type and date.",
  problem: "Manual file organization is repetitive and time-consuming.",
  result:
    "Demonstrates practical automation ability for everyday business workflows.",
  link: "https://github.com/example/file-organizer",
};

export const EMPTY_PROJECT: Project = {
  id: "project-1",
  title: "",
  tools: "",
  description: "",
  problem: "",
  result: "",
  link: "",
};

export const DEFAULT_DRAFT: ProfileDraft = {
  fullName: "",
  skill: SKILLS[0],
  githubUrl: "",
  portfolioUrl: "",
  projects: [EMPTY_PROJECT],
};

/** A ready-to-generate draft built from the sample project. */
export function createSampleDraft(): ProfileDraft {
  return {
    fullName: "Ayesha Khan",
    skill: "Python Development",
    githubUrl: "https://github.com/example",
    portfolioUrl: "",
    projects: [{ ...SAMPLE_PROJECT }],
  };
}

interface GenerationMeta {
  type: GenerationType;
  label: string;
  description: string;
  /** Used as the API `instructions` hint and for card ordering. */
  order: number;
}

/** Ordered card metadata for the generation page. */
export const GENERATION_META: GenerationMeta[] = [
  {
    type: "case_study",
    label: "Portfolio Case Study",
    description: "A client-ready case study for each project.",
    order: 1,
  },
  {
    type: "bio",
    label: "Professional Bio",
    description: "A short, credible bio for your profile and website.",
    order: 2,
  },
  {
    type: "profile_summary",
    label: "Upwork / Fiverr Profile Summary",
    description: "A marketplace-ready overview that wins profile clicks.",
    order: 3,
  },
  {
    type: "proposal",
    label: "Tailored Client Proposal",
    description: "A concise proposal template you can personalize per client.",
    order: 4,
  },
  {
    type: "interview_questions",
    label: "Client Interview Practice",
    description: "Five likely client questions with strong suggested answers.",
    order: 5,
  },
];

export const MAX_PROJECTS = 3;

/** Human-readable labels for the output-length selector. */
export const QUALITY_LABELS: Record<OutputQuality, string> = {
  concise: "Concise",
  balanced: "Balanced",
  detailed: "Detailed",
};

/** Prompt-only hints for each output-length preference. */
export const QUALITY_INSTRUCTIONS: Record<OutputQuality, string> = {
  concise:
    "Length preference: CONCISE. Keep outputs tight and scannable — short sentences, no filler.",
  balanced:
    "Length preference: BALANCED. Clear and specific without padding.",
  detailed:
    "Length preference: DETAILED. Be thorough and concrete; add useful context where it helps.",
};

export const DEFAULT_QUALITY: OutputQuality = "balanced";
