"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Pencil,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePortfolioButton } from "@/components/create-portfolio-button";
import { useSkillProof } from "@/components/providers/skillproof-provider";
import { listMyPortfolios, type PortfolioSummary } from "@/actions/portfolio";
import { isSupabaseConfigured } from "@/lib/env";

export default function DashboardPage() {
  const { hydrated, portfolio, hasDraft } = useSkillProof();
  const [saved, setSaved] = React.useState<PortfolioSummary[] | null>(null);
  const supabaseReady = isSupabaseConfigured();

  React.useEffect(() => {
    if (!supabaseReady) {
      setSaved([]);
      return;
    }
    let active = true;
    listMyPortfolios()
      .then((rows) => {
        if (active) setSaved(rows);
      })
      .catch(() => {
        if (active) setSaved([]);
      });
    return () => {
      active = false;
    };
  }, [supabaseReady]);

  if (!hydrated) {
    return (
      <div className="container py-14">
        <Skeleton className="h-8 w-56" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasAnything = Boolean(portfolio) || (saved && saved.length > 0) || hasDraft;

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-light">Your dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            My portfolios
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Edit, preview and publish your live portfolio, and generate tailored
            proposals and interview prep from the same page.
          </p>
        </div>
        <CreatePortfolioButton label={portfolio ? "Regenerate portfolio" : "Create portfolio site"} />
      </div>

      {portfolio && (
        <Card className="mt-8">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                {portfolio.fullName}
                {portfolio.isPublished ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="warning">Draft</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {portfolio.headline || "No headline yet"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/dashboard/portfolio/${portfolio.id ?? "draft"}/edit`}>
                <Pencil />
                Edit portfolio
              </Link>
            </Button>
            {portfolio.isPublished && portfolio.slug ? (
              <Button asChild variant="outline">
                <Link href={`/p/${portfolio.slug}`} target="_blank">
                  <ExternalLink />
                  View live
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      {saved && saved.length > 0 && (
        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Saved to your account</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((item) => (
              <Card key={item.id} className="flex h-full flex-col">
                <CardHeader>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-teal-light">
                    <Globe className="h-5 w-5" />
                  </span>
                  <CardTitle className="pt-2 text-base">{item.fullName}</CardTitle>
                  <CardDescription>{item.headline || "Portfolio"}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/portfolio/${item.id}/edit`}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                  {item.isPublished ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/p/${item.slug}`} target="_blank">
                        <ExternalLink /> View
                      </Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!hasAnything && (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-teal-light">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            Create your first portfolio
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add a skill and a project, and SkillProof will build a clean, live
            portfolio you can edit and share.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/onboarding">
                <FileText /> Start from my project
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {saved === null && supabaseReady && (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your saved portfolios…
        </p>
      )}
    </div>
  );
}
