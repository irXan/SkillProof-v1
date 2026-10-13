import Link from "next/link";
import { BadgeCheck, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BadgeCheck className="h-4 w-4" />
          </span>
          <span>SkillProof — prove it, pitch it, get hired.</span>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/onboarding" className="hover:text-foreground">
            Build Profile
          </Link>
          <Link href="/generate" className="hover:text-foreground">
            Generate
          </Link>
          <Link href="/portfolio" className="hover:text-foreground">
            Preview
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-1 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>Built for Pakistani freelancers · Irzan Ahmad</p>
          <a
            href="mailto:irzanahmad44@gmail.com"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            irzanahmad44@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
