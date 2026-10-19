import { z } from "zod";

/**
 * Structured output schema for the interview-practice generation.
 * Kept lenient on count (1-10) so a model that returns 4 or 6 items still
 * validates; the app normalises the list to five for display.
 */
export const interviewSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(3),
        answer: z.string().min(3),
      }),
    )
    .min(1)
    .max(10),
});

export type InterviewObject = z.infer<typeof interviewSchema>;

/**
 * Structured output schema for the full portfolio draft.
 *
 * The AI only writes the *content*; ids, links, images, theme and publish state
 * are merged in afterwards from the user's real input so nothing is invented.
 */
export const portfolioDraftSchema = z.object({
  headline: z.string().min(3).max(140),
  bio: z.string().min(20).max(1400),
  skills: z.array(z.string().min(1).max(60)).min(1).max(16),
  services: z
    .array(
      z.object({
        title: z.string().min(2).max(80),
        description: z.string().min(5).max(320),
      }),
    )
    .min(1)
    .max(8),
  contactCta: z.string().min(5).max(260),
  projects: z
    .array(
      z.object({
        title: z.string().min(2).max(140),
        clientType: z.string().max(80).optional(),
        problem: z.string().max(900).optional(),
        approach: z.string().max(900).optional(),
        outcome: z.string().max(900).optional(),
        tools: z.array(z.string().max(60)).max(20).optional(),
      }),
    )
    .min(1)
    .max(6),
});

export type PortfolioDraftData = z.infer<typeof portfolioDraftSchema>;
