"use client";

import * as React from "react";
import { Code2, Globe, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import type { Project, Skill } from "@/types";

interface PortfolioPreviewProps {
  fullName: string;
  skill: Skill;
  githubUrl?: string;
  portfolioUrl?: string;
  projects: Project[];
  bio?: string;
  caseStudy?: string;
}

/**
 * A public-looking portfolio preview. This is intentionally self-contained and
 * responsive so it can be screenshotted for investors or shared as a link.
 */
export function PortfolioPreview({
  fullName,
  skill,
  githubUrl,
  portfolioUrl,
  projects,
  bio,
  caseStudy,
}: PortfolioPreviewProps) {
  const toolTags = React.useMemo(() => collectTools(projects), [projects]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-navy-800 shadow-lg">
      {/* Hero */}
      <div className="bg-hero-glow border-b border-border/60 px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge variant="teal" className="w-fit">
              {skill}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {fullName || "Your Name"}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Freelance {skill} specialist focused on practical, client-ready
              results.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-teal-light hover:underline"
                >
                  <Code2 className="h-4 w-4" /> GitHub
                </a>
              )}
              {portfolioUrl && (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-teal-light hover:underline"
                >
                  <Globe className="h-4 w-4" /> Portfolio
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <CopyButton
              value={
                typeof window !== "undefined"
                  ? window.location.href
                  : "/portfolio"
              }
              label="Copy portfolio link"
              toastMessage="Portfolio link copied"
              variant="default"
            />
            <p className="text-xs text-muted-foreground">
              Shareable preview (local link in this MVP)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10 px-6 py-10 sm:px-10">
        {/* Bio */}
        <section className="space-y-3">
          <SectionHeading>About</SectionHeading>
          {bio ? (
            <Markdown content={bio} />
          ) : (
            <Placeholder>
              Your professional bio will appear here once you generate it.
            </Placeholder>
          )}
        </section>

        {/* Skills / tools */}
        {toolTags.length > 0 && (
          <section className="space-y-3">
            <SectionHeading>Tools &amp; Skills</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {toolTags.map((tool) => (
                <Badge key={tool} variant="outline">
                  {tool}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Case studies */}
        <section className="space-y-4">
          <SectionHeading>Project Case Studies</SectionHeading>
          {caseStudy ? (
            <Card className="bg-navy-900/50">
              <CardContent className="pt-6">
                <Markdown content={caseStudy} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <Card key={project.id} className="bg-navy-900/50">
                  <CardContent className="space-y-3 pt-6">
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {splitTools(project.tools).map((tool) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="rounded-xl border border-border/60 bg-navy-900/50 px-5 py-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Interested in working together?
          </p>
          {githubUrl || portfolioUrl ? (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {portfolioUrl && (
                <Button asChild>
                  <a href={portfolioUrl} target="_blank" rel="noreferrer noopener">
                    <Globe className="h-4 w-4" /> Visit portfolio
                  </a>
                </Button>
              )}
              {githubUrl && (
                <Button asChild variant="outline">
                  <a href={githubUrl} target="_blank" rel="noreferrer noopener">
                    <Code2 className="h-4 w-4" /> View GitHub
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Reach out through your preferred platform to start a conversation.
            </p>
          )}
        </section>
      </div>

      {/* Attribution strip */}
      <div className="flex items-center justify-center gap-2 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-teal-light" />
        Generated with SkillProof
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <Sparkles className="h-4 w-4 text-teal-light" />
      {children}
    </h2>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border/70 bg-navy-900/40 px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function splitTools(tools: string): string[] {
  return tools
    .split(/[,/|]+/)
    .map((tool) => tool.trim())
    .filter(Boolean);
}

/** De-duplicates tool names across all projects, preserving order. */
function collectTools(projects: Project[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const project of projects) {
    for (const tool of splitTools(project.tools)) {
      const key = tool.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(tool);
      }
    }
  }
  return result;
}
