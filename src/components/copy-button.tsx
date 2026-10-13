"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  value: string;
  label?: string;
  copiedLabel?: string;
  toastMessage?: string;
}

/**
 * Copies a string to the clipboard with a short "Copied" confirmation.
 * Falls back to a legacy path when the Clipboard API is unavailable (e.g. on
 * non-secure origins) so the demo keeps working everywhere.
 */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  toastMessage = "Copied to clipboard",
  variant = "outline",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    const success = await writeToClipboard(value);
    if (!success) {
      toast.error("Could not copy. Please copy manually.");
      return;
    }
    setCopied(true);
    toast.success(toastMessage);
    window.setTimeout(() => setCopied(false), 1800);
  }, [value, toastMessage]);

  return (
    <Button onClick={copy} variant={variant} size={size} {...props}>
      {copied ? <Check className="text-teal-light" /> : <Copy />}
      {copied ? copiedLabel : label}
    </Button>
  );
}

async function writeToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
