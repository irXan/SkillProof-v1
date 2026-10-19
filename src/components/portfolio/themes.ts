import type { PortfolioTheme } from "@/types";

/**
 * Static Tailwind class sets for each portfolio theme. Strings are written out
 * literally (not composed dynamically) so Tailwind's JIT can see them.
 */
export interface ThemeClasses {
  root: string;
  hero: string;
  name: string;
  headline: string;
  chip: string;
  card: string;
  cardTitle: string;
  muted: string;
  link: string;
  sectionTitle: string;
  divider: string;
  contactBox: string;
}

export const PORTFOLIO_THEME_CLASSES: Record<PortfolioTheme, ThemeClasses> = {
  aurora: {
    root: "bg-navy-800 text-white",
    hero: "bg-hero-glow border-b border-border/60",
    name: "text-4xl font-bold tracking-tight sm:text-5xl",
    headline: "text-lg text-muted-foreground sm:text-xl",
    chip: "border-teal/30 bg-teal/10 text-teal-light",
    card: "border-border/70 bg-card/60",
    cardTitle: "text-white",
    muted: "text-muted-foreground",
    link: "text-teal-light hover:underline",
    sectionTitle: "text-2xl font-semibold tracking-tight text-white",
    divider: "border-border/60",
    contactBox: "border-border/60 bg-navy-900/50",
  },
  minimal: {
    root: "bg-white text-slate-900",
    hero: "bg-slate-50 border-b border-slate-200",
    name: "text-4xl font-bold tracking-tight sm:text-5xl",
    headline: "text-lg text-slate-600 sm:text-xl",
    chip: "border-teal/40 bg-teal/10 text-teal-dark",
    card: "border-slate-200 bg-white",
    cardTitle: "text-slate-900",
    muted: "text-slate-500",
    link: "text-teal-dark hover:underline",
    sectionTitle: "text-2xl font-semibold tracking-tight text-slate-900",
    divider: "border-slate-200",
    contactBox: "border-slate-200 bg-slate-50",
  },
  bold: {
    root: "bg-[#05080f] text-white",
    hero: "bg-[#0b1f3a] border-b-4 border-teal",
    name: "text-5xl font-extrabold uppercase tracking-tight sm:text-6xl",
    headline: "text-lg font-medium text-slate-300 sm:text-xl",
    chip: "border-teal bg-teal/20 text-white",
    card: "border-teal/40 bg-[#0b1f3a]",
    cardTitle: "text-white",
    muted: "text-slate-300",
    link: "text-teal-light hover:underline",
    sectionTitle: "text-2xl font-bold uppercase tracking-tight text-white",
    divider: "border-teal/30",
    contactBox: "border-teal/40 bg-[#0b1f3a]",
  },
};
