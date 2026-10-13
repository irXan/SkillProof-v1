import { z } from "zod";
import { SKILLS, type Skill } from "@/types";
import { MAX_PROJECTS } from "@/lib/constants";

/**
 * An optional URL field. An empty string is allowed so users are never blocked
 * by an optional field, but any non-empty value must be a real http(s) link.
 */
const optionalUrl = z
  .string()
  .trim()
  .max(500, "Keep links under 500 characters")
  .optional()
  .refine(
    (value) => !value || /^https?:\/\/.+/i.test(value),
    "Enter a valid link starting with http:// or https://",
  );

const projectSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(3, "Project title must be at least 3 characters")
    .max(120, "Keep the title under 120 characters"),
  tools: z
    .string()
    .trim()
    .min(2, "List at least one tool or technology")
    .max(200, "Keep tools under 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Describe what you built (at least 10 characters)")
    .max(1200, "Keep the description under 1200 characters"),
  problem: z
    .string()
    .trim()
    .min(10, "Describe the problem it solves (at least 10 characters)")
    .max(1200, "Keep the problem under 1200 characters"),
  result: z
    .string()
    .trim()
    .min(10, "Describe the result or purpose (at least 10 characters)")
    .max(1200, "Keep the result under 1200 characters"),
  link: optionalUrl,
});

export const skillEnum = z.enum([...SKILLS] as [Skill, ...Skill[]]);

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(80, "Keep your name under 80 characters"),
  skill: skillEnum,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  projects: z
    .array(projectSchema)
    .min(1, "Add at least one project")
    .max(MAX_PROJECTS, `Add at most ${MAX_PROJECTS} projects`),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Request body accepted by POST /api/generate. */
export const generateRequestSchema = z.object({
  type: z.enum([
    "case_study",
    "bio",
    "profile_summary",
    "proposal",
    "interview_questions",
  ]),
  profile: z.object({
    fullName: z.string().trim().min(1).max(80),
    skill: skillEnum,
    githubUrl: z.string().trim().max(500).optional(),
    portfolioUrl: z.string().trim().max(500).optional(),
  }),
  projects: z.array(projectSchema).min(1).max(MAX_PROJECTS),
  /** Free-text client job description used to tailor proposals. */
  clientContext: z.string().trim().max(2000).optional(),
  /** Optional user steer for regeneration. */
  instructions: z.string().trim().max(500).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
