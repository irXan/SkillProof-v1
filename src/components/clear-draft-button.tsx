"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useSkillProof } from "@/components/providers/skillproof-provider";

/**
 * Clears the saved draft + generated outputs from localStorage. Rendered only
 * when a draft exists. Uses a small inline confirm rather than a browser dialog.
 */
export function ClearDraftButton({
  showLabel = true,
  className,
  ...props
}: ButtonProps & { showLabel?: boolean }) {
  const router = useRouter();
  const { hydrated, hasDraft, reset } = useSkillProof();
  const [confirming, setConfirming] = React.useState(false);

  if (!hydrated || !hasDraft) {
    return null;
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Clear draft?
        </span>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => {
            reset();
            setConfirming(false);
            toast.success("Draft cleared.");
            router.push("/");
          }}
        >
          Clear
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setConfirming(true)}
      {...props}
    >
      <Trash2 />
      {showLabel && <span className="hidden sm:inline">Clear draft</span>}
    </Button>
  );
}
