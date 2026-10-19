"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useSkillProof } from "@/components/providers/skillproof-provider";
import { buildDemoPortfolio } from "@/lib/demo";
import type { Portfolio } from "@/types";

interface CreatePortfolioButtonProps extends ButtonProps {
  label?: string;
}

/**
 * Generates the structured portfolio draft and opens the editor. If the AI is
 * unavailable (or fails), it falls back to an honest Demo Mode portfolio so the
 * editor → publish flow still works end to end.
 */
export function CreatePortfolioButton({
  label = "Create portfolio site",
  ...props
}: CreatePortfolioButtonProps) {
  const router = useRouter();
  const { draft, setPortfolio } = useSkillProof();
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    if (!draft.fullName || draft.projects.length === 0) {
      toast.error("Add your name and at least one project first.");
      router.push("/onboarding");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            fullName: draft.fullName,
            skill: draft.skill,
            githubUrl: draft.githubUrl,
            portfolioUrl: draft.portfolioUrl,
          },
          projects: draft.projects,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { portfolio?: Portfolio; demo?: boolean; error?: string }
        | null;

      if (!res.ok || !data?.portfolio) {
        throw new Error(data?.error ?? "Generation failed.");
      }

      setPortfolio(data.portfolio as Portfolio);
      toast.success(
        data.demo
          ? "Demo Mode: sample portfolio ready to edit."
          : "Portfolio draft ready to edit.",
      );
    } catch {
      setPortfolio(buildDemoPortfolio(draft) as Portfolio);
      toast.warning("AI unavailable — loaded demo content you can edit.");
    } finally {
      setPending(false);
      router.push("/dashboard/portfolio/draft/edit");
    }
  }

  return (
    <Button {...props} onClick={handleClick} disabled={pending || props.disabled}>
      {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {pending ? "Generating portfolio…" : label}
    </Button>
  );
}
