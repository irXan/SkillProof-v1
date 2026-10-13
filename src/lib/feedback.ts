import { STORAGE_KEY } from "@/lib/constants";
import type { GenerationType } from "@/types";

/**
 * Very light local feedback store. Ratings never leave the browser; the schema
 * has no ratings table, so we keep them in localStorage keyed by output type.
 */
export type Rating = "helpful" | "not_helpful";

const FEEDBACK_KEY = `${STORAGE_KEY}:feedback`;
const isBrowser = typeof window !== "undefined";

export function loadFeedback(): Partial<Record<GenerationType, Rating>> {
  if (!isBrowser) return {};
  try {
    const raw = window.localStorage.getItem(FEEDBACK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Partial<Record<GenerationType, Rating>>)
      : {};
  } catch {
    return {};
  }
}

export function saveFeedback(type: GenerationType, rating: Rating): void {
  if (!isBrowser) return;
  try {
    const current = loadFeedback();
    current[type] = rating;
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(current));
  } catch {
    /* feedback is best-effort only */
  }
}
