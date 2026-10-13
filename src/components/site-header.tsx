"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearDraftButton } from "@/components/clear-draft-button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#benefits", label: "Why SkillProof" },
  { href: "/onboarding", label: "Build Profile" },
  { href: "/generate", label: "Generate" },
  { href: "/portfolio", label: "Preview" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Skill<span className="text-teal-light">Proof</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ClearDraftButton />
          <Button asChild size="sm">
            <Link href="/onboarding">Create My Portfolio</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border/60 md:hidden">
          <nav className="container flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 mb-3 flex items-center justify-between gap-2">
              <ClearDraftButton />
              <Button asChild>
                <Link href="/onboarding" onClick={() => setOpen(false)}>
                  Create My Portfolio
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
