"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Briefcase,
  FileText,
  Gauge,
  Loader2,
  MessagesSquare,
  Send,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GenerationCard, type GenerationStatus } from "@/components/generation-card";
import { CreatePortfolioButton } from "@/components/create-portfolio-button";
import { useSkillProof } from "@/components/providers/skillproof-provider";
import {
  createSampleDraft,
  GENERATION_META,
  QUALITY_INSTRUCTIONS,
  QUALITY_LABELS,
} from "@/lib/constants";
import { buildDemoGeneration } from "@/lib/demo";
import { OUTPUT_QUALITIES } from "@/types";
import type { GenerationType, OutputQuality } from "@/types";
import type { LucideIcon as LucideIconType } from "lucide-react";

const ICONS: Record<GenerationType, LucideIconType> = {
  case_study: FileText,
  bio: UserRound,
  profile_summary: Briefcase,
  proposal: Send,
  interview_questions: MessagesSquare,
};

const ORDERED_TYPES: GenerationType[] = [...GENERATION_META]
  .sort((a, b) => a.order - b.order)
  .map((meta) => meta.type);

interface AiStatus {
  configured: boolean;
  model: string | null;
}

export default function GeneratePage() {
  const {
    hydrated,
    draft,
    generations,
    quality,
    setQuality,
    setGeneration,
    markGenerated,
    hasDraft,
    setDraft,
  } = useSkillProof();

  const [statuses, setStatuses] = React.useState<
    Partial<Record<GenerationType, GenerationStatus>>
  >({});
  const [errors, setErrors] = React.useState<
    Partial<Record<GenerationType, string>>
  >({});
  const [aiStatus, setAiStatus] = React.useState<AiStatus | null>(null);
  const [clientContext, setClientContext] = React.useState("");
  const autoRanRef = React.useRef(false);

  const isConfigured = aiStatus?.configured ?? true;

  // Probe AI configuration once so we can show a helpful banner if unset.
  React.useEffect(() => {
    let active = true;
    fetch("/api/generate", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: AiStatus) => {
        if (active) setAiStatus(data);
      })
      .catch(() => {
        if (active) setAiStatus({ configured: false, model: null });
      });
    return () => {
      active = false;
    };
  }, []);

  // Demo Mode: instant, offline, clearly-labelled sample output.
  const applyDemo = React.useCallback(
    (type: GenerationType) => {
      setGeneration(type, buildDemoGeneration(type, draft));
      setErrors((prev) => ({ ...prev, [type]: undefined }));
      setStatuses((prev) => ({ ...prev, [type]: "demo" }));
    },
    [draft, setGeneration],
  );

  const runGeneration = React.useCallback(
    async (type: GenerationType) => {
      setErrors((prev) => ({ ...prev, [type]: undefined }));
      setStatuses((prev) => ({ ...prev, [type]: "loading" }));

      if (!isConfigured) {
        applyDemo(type);
        return;
      }

      const payload = {
        type,
        profile: {
          fullName: draft.fullName,
          skill: draft.skill,
          githubUrl: draft.githubUrl,
          portfolioUrl: draft.portfolioUrl,
        },
        projects: draft.projects,
        clientContext: clientContext.trim() || undefined,
        instructions: QUALITY_INSTRUCTIONS[quality],
      };

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await res.json().catch(() => null)) as
          | { content?: string; error?: string }
          | null;

        if (!res.ok || !data?.content) {
          throw new Error(
            data?.error ?? "Generation failed. Please try again.",
          );
        }

        setGeneration(type, data.content);
        setStatuses((prev) => ({ ...prev, [type]: "done" }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Generation failed.";
        setErrors((prev) => ({ ...prev, [type]: message }));
        setStatuses((prev) => ({ ...prev, [type]: "error" }));
      }
    },
    [draft, clientContext, quality, isConfigured, setGeneration, applyDemo],
  );

  const generateAll = React.useCallback(async () => {
    await Promise.allSettled(ORDERED_TYPES.map((type) => runGeneration(type)));
    markGenerated();
  }, [runGeneration, markGenerated]);

  // Auto-run generation the first time a complete draft + AI status are ready.
  React.useEffect(() => {
    if (!hydrated || !hasDraft || !aiStatus || autoRanRef.current) return;
    if (!draft.fullName || draft.projects.length === 0) return;

    autoRanRef.current = true;

    if (Object.keys(generations).length > 0) {
      // Returning visitor with saved outputs — reflect them as "done".
      const next: Partial<Record<GenerationType, GenerationStatus>> = {};
      GENERATION_META.forEach((meta) => {
        if (generations[meta.type]) next[meta.type] = "done";
      });
      setStatuses((prev) => ({ ...prev, ...next }));
      return;
    }

    void generateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hasDraft, aiStatus]);

  const getStatus = (type: GenerationType): GenerationStatus =>
    statuses[type] ?? (generations[type] ? "done" : "idle");

  const anyLoading = GENERATION_META.some(
    (meta) => getStatus(meta.type) === "loading",
  );
  const settledCount = GENERATION_META.filter((meta) => {
    const status = getStatus(meta.type);
    return status === "done" || status === "demo" || status === "error";
  }).length;
  const isBlankDraft = hydrated && (!hasDraft || !draft.fullName);

  const loadSample = () => {
    setDraft(createSampleDraft());
    toast.success("Sample project loaded. Generating…");
  };

  if (!hydrated) {
    return <GenerateSkeleton />;
  }

  // Empty state when the visitor lands here before building a profile.
  if (isBlankDraft) {
    return (
      <div className="container max-w-2xl py-20 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-teal-light">
          <Wand2 className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Nothing to generate yet
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add your skill and at least one project, then SkillProof will write
          your portfolio, proposal, and interview prep. No account needed.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/onboarding">
              Build my profile
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="outline" onClick={loadSample}>
            <Sparkles />
            Load sample &amp; generate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-light">Step 2 of 3</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Your generated proof
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
            <Badge variant="teal">{draft.skill}</Badge>
            <span>for {draft.fullName}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {anyLoading && (
            <span
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating {settledCount}/{GENERATION_META.length}…
            </span>
          )}
          <Button onClick={() => void generateAll()} disabled={anyLoading}>
            {anyLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            Generate all
          </Button>
          <CreatePortfolioButton />
        </div>
      </div>

      {aiStatus && !aiStatus.configured ? (
        <Alert variant="info" className="mt-6">
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            Connect an AI API key to generate live results. For now these are
            realistic sample outputs you can copy and explore.
          </AlertDescription>
        </Alert>
      ) : (
        aiStatus?.configured && (
          <Alert variant="success" className="mt-6">
            <AlertDescription>
              Live AI is active
              {aiStatus.model && (
                <>
                  {" "}
                  using{" "}
                  <span className="font-mono text-teal-light">
                    {aiStatus.model}
                  </span>
                </>
              )}
              .
            </AlertDescription>
          </Alert>
        )
      )}

      {isConfigured && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4 text-teal-light" />
              Tailor your outputs (optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="quality" className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-teal-light" />
                Output length
              </Label>
              <Select
                value={quality}
                onValueChange={(next) => setQuality(next as OutputQuality)}
              >
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_QUALITIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {QUALITY_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientContext" className="sr-only">
                Client job description
              </Label>
              <Textarea
                id="clientContext"
                value={clientContext}
                onChange={(e) => setClientContext(e.target.value)}
                placeholder="Paste a client's job post here and the proposal card will be tailored to it. Then hit Regenerate on that card."
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {GENERATION_META.map((meta) => (
          <GenerationCard
            key={meta.type}
            type={meta.type}
            label={meta.label}
            description={meta.description}
            icon={ICONS[meta.type]}
            status={getStatus(meta.type)}
            content={generations[meta.type]}
            error={errors[meta.type]}
            onRegenerate={() => void runGeneration(meta.type)}
            onUseDemo={() => applyDemo(meta.type)}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button asChild size="lg">
          <Link href="/portfolio">
            Continue to portfolio preview
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function GenerateSkeleton() {
  return (
    <div className="container py-14">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-40" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
