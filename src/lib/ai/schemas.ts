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
