"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Loader2,
  MessagesSquare,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import { PortfolioPreview } from "@/components/portfolio-preview";
import { useSkillProof } from "@/components/providers/skillproof-provider";
import { savePortfolio } from "@/actions/save-portfolio";
import { isSupabaseConfigured } from "@/lib/env";
import type { GenerationType } from "@/types";

const EXTRA_ASSETS: {
  type: GenerationType;
  label: string;
  description: string;
}[] = [
  {
    type: "profile_summary",
    label: "Upwork / Fiverr Profile Summary",
    description: "Paste this straight into your marketplace profile.",
  },
  {
    type: "proposal",
    label: "Tailored Client Proposal",
    description: "Personalize the placeholders before sending.",
  },
  {
    type: "interview_questions",
    label: "Client Interview Practice",
    description: "Rehearse these before your next call.",
  },
];

export default function PortfolioPage() {
  const { hydrated, draft, generations, patchDraft, hasDraft } = useSkillProof();
  const [saving, setSaving] = React.useState(false);
  const canSave = isSupabaseConfigured();

  if (!hydrated) {
    return (
      <div className="container py-14">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-8 h-[420px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!hasDraft && !draft.fullName) {
    return (
      <div className="container max-w-2xl py-20 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-teal-light">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          No portfolio yet
        </h1>
        <p className="mt-2 text-muted-foreground">
          Build your profile and generate your proof, then come back here to
          preview and share it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/onboarding">Build my profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/generate">Go to generation</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasAnyGeneration = Object.keys(generations).length > 0;

  async function handleSave() {
    setSaving(true);
    try {
      const result = await savePortfolio({ draft, generations });
      if (result.ok) {
        toast.success("Saved to your account.");
      } else if (result.requiresAuth) {
        toast.error("Please sign in to save to your account.");
      } else {
        toast.error(result.error ?? "Could not save.");
      }
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-light">Step 3 of 3</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Your portfolio preview
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            This is how your work looks to a client. Copy any section or share
            the preview link.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/generate">
              <ArrowLeft />
              Back to generation
            </Link>
          </Button>
          {canSave && (
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              Save to my account
            </Button>
          )}
        </div>
      </div>

      {!hasAnyGeneration && (
        <Alert variant="info" className="mt-6">
          <AlertDescription>
            You haven&apos;t generated anything yet. The preview below uses your
            raw project details.{" "}
            <Link href="/generate" className="font-medium underline">
              Generate your proof
            </Link>{" "}
            to fill it in.
          </AlertDescription>
        </Alert>
      )}

      {/* Editable name */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Display name</CardTitle>
          <CardDescription>
            Shown at the top of your public portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-md space-y-2">
          <Label htmlFor="portfolioName">Your name</Label>
          <Input
            id="portfolioName"
            value={draft.fullName}
            onChange={(e) => patchDraft({ fullName: e.target.value })}
            placeholder="Your Name"
          />
        </CardContent>
      </Card>

      <div className="mt-6">
        <PortfolioPreview
          fullName={draft.fullName || "Your Name"}
          skill={draft.skill}
          githubUrl={draft.githubUrl}
          portfolioUrl={draft.portfolioUrl}
          projects={draft.projects}
          bio={generations.bio}
          caseStudy={generations.case_study}
        />
      </div>

      {hasAnyGeneration && (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            More client-ready assets
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {EXTRA_ASSETS.map((asset) => {
              const content = generations[asset.type];
              const Icon =
                asset.type === "proposal"
                  ? Send
                  : asset.type === "profile_summary"
                    ? Briefcase
                    : MessagesSquare;
              return (
                <Card key={asset.type} className="flex h-full flex-col">
                  <CardHeader>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-teal-light">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="pt-2 text-base">
                      {asset.label}
                    </CardTitle>
                    <CardDescription>{asset.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="flex-1 rounded-lg border border-border/60 bg-navy-900/40 p-4">
                      {content ? (
                        <Markdown content={content} />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not generated yet.
                        </p>
                      )}
                    </div>
                    <CopyButton
                      value={content ?? ""}
                      disabled={!content}
                      className="w-fit"
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <FileText className="h-4 w-4 text-teal-light" />
        <p className="text-sm text-muted-foreground">
          Tip: use the{" "}
          <span className="text-foreground">Copy portfolio link</span> button on
          the preview to share it.
        </p>
      </div>
    </div>
  );
}
