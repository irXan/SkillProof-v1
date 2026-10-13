"use client";

import * as React from "react";
import { DEFAULT_DRAFT, DEFAULT_QUALITY } from "@/lib/constants";
import { clearState, loadState, saveState } from "@/lib/storage";
import type {
  GenerationType,
  Generations,
  OutputQuality,
  ProfileDraft,
} from "@/types";

interface SkillProofContextValue {
  /** False until localStorage has been read on the client. */
  hydrated: boolean;
  draft: ProfileDraft;
  generations: Generations;
  generatedAt?: string;
  quality: OutputQuality;
  isDemo: boolean;
  hasDraft: boolean;
  setDraft: (draft: ProfileDraft) => void;
  patchDraft: (patch: Partial<ProfileDraft>) => void;
  setGeneration: (type: GenerationType, content: string) => void;
  setGenerations: (generations: Generations) => void;
  setQuality: (quality: OutputQuality) => void;
  markGenerated: () => void;
  reset: () => void;
}

const SkillProofContext = React.createContext<SkillProofContextValue | null>(
  null,
);

/**
 * Holds the in-memory draft + generated content and mirrors it to
 * localStorage so the demo survives navigation and page reloads without any
 * account or backend.
 */
export function SkillProofProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = React.useState(false);
  const [draft, setDraftState] = React.useState<ProfileDraft>(DEFAULT_DRAFT);
  const [generations, setGenerationsState] = React.useState<Generations>({});
  const [generatedAt, setGeneratedAt] = React.useState<string | undefined>();
  const [quality, setQualityState] = React.useState<OutputQuality>(DEFAULT_QUALITY);
  const [isDemo, setIsDemo] = React.useState(true);
  const [hasDraft, setHasDraft] = React.useState(false);

  // Hydrate once on mount.
  React.useEffect(() => {
    const stored = loadState();
    if (stored) {
      setDraftState(stored.draft);
      setGenerationsState(stored.generations ?? {});
      setGeneratedAt(stored.generatedAt);
      if (stored.quality) setQualityState(stored.quality);
      setIsDemo(!stored.userId);
      setHasDraft(true);
    }
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration).
  React.useEffect(() => {
    if (!hydrated) return;
    saveState({
      userId: isDemo ? null : "local",
      draft,
      generations,
      quality,
      generatedAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, draft, generations, quality, generatedAt, isDemo]);

  const setDraft = React.useCallback((next: ProfileDraft) => {
    setDraftState(next);
    setHasDraft(true);
  }, []);

  const patchDraft = React.useCallback((patch: Partial<ProfileDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setGeneration = React.useCallback(
    (type: GenerationType, content: string) => {
      setGenerationsState((prev) => ({ ...prev, [type]: content }));
    },
    [],
  );

  const setGenerations = React.useCallback((next: Generations) => {
    setGenerationsState(next);
  }, []);

  const setQuality = React.useCallback((next: OutputQuality) => {
    setQualityState(next);
  }, []);

  const markGenerated = React.useCallback(() => {
    setGeneratedAt(new Date().toISOString());
  }, []);

  const reset = React.useCallback(() => {
    clearState();
    setDraftState(DEFAULT_DRAFT);
    setGenerationsState({});
    setGeneratedAt(undefined);
    setQualityState(DEFAULT_QUALITY);
    setHasDraft(false);
    setIsDemo(true);
  }, []);

  const value: SkillProofContextValue = {
    hydrated,
    draft,
    generations,
    generatedAt,
    quality,
    isDemo,
    hasDraft,
    setDraft,
    patchDraft,
    setGeneration,
    setGenerations,
    setQuality,
    markGenerated,
    reset,
  };

  return (
    <SkillProofContext.Provider value={value}>
      {children}
    </SkillProofContext.Provider>
  );
}

export function useSkillProof() {
  const context = React.useContext(SkillProofContext);
  if (!context) {
    throw new Error("useSkillProof must be used within <SkillProofProvider>");
  }
  return context;
}
