import {
  Code2,
  Download,
  Globe,
  Link2,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PORTFOLIO_THEME_CLASSES } from "@/components/portfolio/themes";
import type { Portfolio, PortfolioProject } from "@/types";

interface PortfolioRendererProps {
  portfolio: Portfolio;
  className?: string;
}

/** Projects ordered with featured ones first, then by display order. */
function orderedProjects(portfolio: Portfolio): PortfolioProject[] {
  return [...portfolio.projects].sort(
    (a, b) =>
      Number(b.isFeatured) - Number(a.isFeatured) ||
      a.displayOrder - b.displayOrder,
  );
}

/**
 * The public-facing portfolio. Shared by the live editor preview and the
 * published `/p/[slug]` page so they never drift. Themeable and responsive.
 */
export function PortfolioRenderer({ portfolio, className }: PortfolioRendererProps) {
  const t = PORTFOLIO_THEME_CLASSES[portfolio.theme] ?? PORTFOLIO_THEME_CLASSES.aurora;
  const visible = (key: string) =>
    portfolio.sections.find((section) => section.key === key)?.isVisible ?? true;
  const projects = orderedProjects(portfolio);

  return (
    <div className={cn("min-h-full", t.root, className)}>
      {/* Hero */}
      <header className={cn("px-6 py-14 sm:px-10 sm:py-20", t.hero)}>
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 sm:flex-row sm:items-center">
          {portfolio.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portfolio.profileImageUrl}
              alt={`${portfolio.fullName} profile photo`}
              className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
            />
          ) : null}
          <div className="space-y-3">
            <p className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", t.chip)}>
              <Sparkles className="h-3.5 w-3.5" />
              Available for freelance work
            </p>
            <h1 className={t.name}>{portfolio.fullName}</h1>
            {portfolio.headline ? (
              <p className={cn("max-w-2xl", t.headline)}>{portfolio.headline}</p>
            ) : null}
            <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-sm", t.muted)}>
              {portfolio.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {portfolio.location}
                </span>
              ) : null}
              <Links portfolio={portfolio} className={t.link} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-14 px-6 py-14 sm:px-10">
        {/* About */}
        {visible("about") && portfolio.bio ? (
          <Section title="About" theme={t}>
            <p className={cn("max-w-3xl text-base leading-relaxed", t.muted)}>
              {portfolio.bio}
            </p>
          </Section>
        ) : null}

        {/* Skills */}
        {visible("skills") && portfolio.skills.length > 0 ? (
          <Section title="Skills" theme={t}>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <span
                  key={skill}
                  className={cn("rounded-full border px-3 py-1 text-sm", t.chip)}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Services */}
        {visible("services") && portfolio.services.length > 0 ? (
          <Section title="Services" theme={t}>
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolio.services.map((service) => (
                <div key={service.title} className={cn("rounded-2xl border p-5", t.card)}>
                  <h3 className={cn("font-semibold", t.cardTitle)}>{service.title}</h3>
                  <p className={cn("mt-1.5 text-sm leading-relaxed", t.muted)}>
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Projects */}
        {visible("projects") && projects.length > 0 ? (
          <Section title="Projects" theme={t}>
            <div className="space-y-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} theme={t} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Contact */}
        {visible("contact") ? (
          <section className={cn("rounded-2xl border px-6 py-10 text-center sm:px-10", t.contactBox)}>
            <h2 className={t.sectionTitle}>Let&apos;s work together</h2>
            <p className={cn("mx-auto mt-3 max-w-xl text-sm", t.muted)}>
              {portfolio.contactCta ||
                "Have a project in mind? Get in touch and I'll reply with how I'd approach it."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {portfolio.email ? (
                <Button asChild>
                  <a href={`mailto:${portfolio.email}`}>
                    <Mail /> Contact me
                  </a>
                </Button>
              ) : null}
              {portfolio.githubUrl ? (
                <Button asChild variant="outline">
                  <a href={portfolio.githubUrl} target="_blank" rel="noreferrer noopener">
                    <Code2 /> GitHub
                  </a>
                </Button>
              ) : null}
              {portfolio.websiteUrl ? (
                <Button asChild variant="outline">
                  <a href={portfolio.websiteUrl} target="_blank" rel="noreferrer noopener">
                    <Globe /> Website
                  </a>
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      <footer className={cn("border-t px-6 py-6 text-center text-xs", t.divider, t.muted)}>
        Created with{" "}
        <span className="font-semibold">
          Skill<span className="text-teal-light">Proof</span>
        </span>
      </footer>
    </div>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: (typeof PORTFOLIO_THEME_CLASSES)["aurora"];
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className={theme.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function ProjectCard({
  project,
  theme,
}: {
  project: PortfolioProject;
  theme: (typeof PORTFOLIO_THEME_CLASSES)["aurora"];
}) {
  return (
    <article className={cn("overflow-hidden rounded-2xl border", theme.card)}>
      {project.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.imageUrl}
          alt={`${project.title} preview`}
          className="h-48 w-full object-cover"
        />
      ) : null}
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={cn("text-lg font-semibold", theme.cardTitle)}>{project.title}</h3>
          {project.isFeatured ? <Badge variant="teal">Featured</Badge> : null}
          {project.clientType ? (
            <span className={cn("text-xs", theme.muted)}>For {project.clientType}</span>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {project.problem ? <Field label="Problem" theme={theme}>{project.problem}</Field> : null}
          {project.approach ? <Field label="Approach" theme={theme}>{project.approach}</Field> : null}
          {project.outcome ? <Field label="Outcome" theme={theme}>{project.outcome}</Field> : null}
        </div>

        {project.tools.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span key={tool} className={cn("rounded-full border px-2.5 py-0.5 text-xs", theme.chip)}>
                {tool}
              </span>
            ))}
          </div>
        ) : null}

        {(project.projectUrl || project.githubUrl) ? (
          <div className="flex flex-wrap gap-3 text-sm">
            {project.projectUrl ? (
              <a href={project.projectUrl} target="_blank" rel="noreferrer noopener" className={cn("inline-flex items-center gap-1.5", theme.link)}>
                <Globe className="h-4 w-4" /> Live project
              </a>
            ) : null}
            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noreferrer noopener" className={cn("inline-flex items-center gap-1.5", theme.link)}>
                <Code2 className="h-4 w-4" /> Code
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Field({
  label,
  theme,
  children,
}: {
  label: string;
  theme: (typeof PORTFOLIO_THEME_CLASSES)["aurora"];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-light">
        {label}
      </p>
      <p className={cn("text-sm leading-relaxed", theme.muted)}>{children}</p>
    </div>
  );
}

function Links({ portfolio, className }: { portfolio: Portfolio; className: string }) {
  const links = [
    portfolio.githubUrl ? { href: portfolio.githubUrl, label: "GitHub", icon: Code2 } : null,
    portfolio.linkedinUrl ? { href: portfolio.linkedinUrl, label: "LinkedIn", icon: Link2 } : null,
    portfolio.websiteUrl ? { href: portfolio.websiteUrl, label: "Website", icon: Globe } : null,
    portfolio.resumeUrl ? { href: portfolio.resumeUrl, label: "Résumé", icon: Download } : null,
  ].filter(Boolean) as { href: string; label: string; icon: typeof Code2 }[];

  if (links.length === 0) return null;

  return (
    <>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          className={cn("inline-flex items-center gap-1.5", className)}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </a>
      ))}
    </>
  );
}
