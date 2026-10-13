"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Check, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import { loadFeedback, saveFeedback, type Rating } from "@/lib/feedback";
import type { GenerationType } from "@/types";

export type GenerationStatus = "idle" | "loading" | "done" | "error" | "demo";

interface GenerationCardProps {
  type: GenerationType;
  label: string;
  description: string;
  icon: LucideIcon;
  status: GenerationStatus;
  content?: string;
  error?: string;
  onRegenerate: () => void;
  onUseDemo: () => void;
}

/**
 * A single AI output panel: header with copy + regenerate controls, body that
 * shows a skeleton while loading, rendered Markdown when done, or an inline
 * error with retry / demo-recovery actions.
 */
export function GenerationCard({
  type,
  label,
  description,
  icon: Icon,
  status,
  content,
  error,
  onRegenerate,
  onUseDemo,
}: GenerationCardProps) {
  const isLoading = status === "loading";
  const hasContent = Boolean(content);
  const [rating, setRating] = React.useState<Rating | undefined>();

  React.useEffect(() => {
    setRating(loadFeedback()[type]);
  }, [type]);

  const rate = (value: Rating) => {
    setRating(value);
    saveFeedback(type, value);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-teal-light">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {label}
              {status === "demo" && <Badge variant="warning">Demo</Badge>}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="min-h-[140px] flex-1 rounded-lg border border-border/60 bg-elevated/60 p-4">
          {isLoading && <LoadingState />}

          {!isLoading && status === "error" && (
            <ErrorState
              message={error ?? "Generation failed. Please try again."}
              onRetry={onRegenerate}
              onUseDemo={onUseDemo}
            />
          )}

          {!isLoading && status !== "error" && content && (
            <Markdown content={content} />
          )}

          {!isLoading && status !== "error" && !content && (
            <div className="flex h-full min-h-[110px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Sparkles className="h-5 w-5 text-teal-light/70" />
              <p>This output will appear here.</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton
              value={content ?? ""}
              disabled={!hasContent || isLoading}
              label="Copy"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className={isLoading ? "animate-spin" : undefined} />
              {content ? "Regenerate" : "Generate"}
            </Button>
          </div>

          {hasContent && !isLoading && (
            <Rating value={rating} onRate={rate} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Rating({
  value,
  onRate,
}: {
  value?: Rating;
  onRate: (value: Rating) => void;
}) {
  if (value) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-teal-light" />
        Thanks for the feedback.
      </p>
    );
  }
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="mr-1">Was this useful?</span>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onRate("helpful")}>
        Helpful
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onRate("not_helpful")}
      >
        Not helpful
      </Button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  onUseDemo,
}: {
  message: string;
  onRetry: () => void;
  onUseDemo: () => void;
}) {
  return (
    <div className="flex h-full min-h-[110px] flex-col justify-center gap-3">
      <div className="flex items-start gap-2 text-sm text-red-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p>{message}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your project data is safe.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw />
          Retry
        </Button>
        <Button variant="ghost" size="sm" onClick={onUseDemo}>
          <Sparkles />
          Use demo output
        </Button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3" aria-label="Generating" role="status">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-4/5" />
      <p className="pt-1 text-xs text-muted-foreground">Writing with AI…</p>
    </div>
  );
}
