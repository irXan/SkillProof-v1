import { STORAGE_KEY } from "@/lib/constants";
import type { SkillProofState } from "@/types";

/**
 * Lightweight persistence for the demo flow. All state lives in localStorage
 * so "Try demo without account" works with zero backend setup. When a user is
 * logged in we still keep a local copy for instant resume, and optionally
 * mirror it to Supabase via the savePortfolio server action.
 */

const isBrowser = typeof window !== "undefined";

export function loadState(): SkillProofState | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SkillProofState;
    if (!parsed || typeof parsed !== "object" || !parsed.draft) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: SkillProofState) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage can fail in private mode — the app still works in memory. */
  }
}

export function clearState() {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
