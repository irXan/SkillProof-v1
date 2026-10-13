"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useSkillProof } from "@/components/providers/skillproof-provider";
import { createSampleDraft } from "@/lib/constants";

/**
 * One-click demo entry: loads the sample project and jumps straight to
 * generation. Works entirely in the browser (Demo Mode included).
 */
export function TryDemoButton({
  label = "Try Demo",
  ...props
}: ButtonProps & { label?: string }) {
  const router = useRouter();
  const { setDraft } = useSkillProof();

  return (
    <Button
      {...props}
      onClick={() => {
        setDraft(createSampleDraft());
        router.push("/generate");
      }}
    >
      <Sparkles />
      {label}
    </Button>
  );
}
