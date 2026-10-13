import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  MessagesSquare,
  Send,
  Share2,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TryDemoButton } from "@/components/try-demo-button";

const BENEFITS = [
  {
    icon: FileText,
    title: "Portfolio Case Studies",
    description:
      "Turn personal projects and coursework into credible, client-focused case studies you can show instead of telling.",
  },
  {
    icon: Send,
    title: "Client-Ready Proposals",
    description:
      "Generate concise, personalized proposals that speak directly to a client's problem and your proven ability.",
  },
  {
    icon: MessagesSquare,
    title: "Interview Practice",
    description:
      "Rehearse the five questions clients actually ask, with confident but honest answers grounded in your real work.",
  },
];

const STEPS = [
  {
    icon: UserRound,
    title: "1. Add projects",
    description:
      "Pick your skill and add up to three projects — or load the sample project and see it instantly.",
  },
  {
    icon: Wand2,
    title: "2. Generate proof",
    description:
      "Get a case study, bio, marketplace profile, proposal, and interview answers in one pass.",
  },
  {
    icon: MessagesSquare,
    title: "3. Practice interview",
    description:
      "Rehearse the five questions clients actually ask, with confident but honest answers.",
  },
  {
    icon: Share2,
    title: "4. Share portfolio",
    description:
      "Preview a clean portfolio, copy any section, and start pitching with proof instead of promises.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-hero-glow">
      {/* Hero */}
      <section className="container py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-in space-y-6">
            <Badge variant="teal" className="w-fit">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              For beginner freelancers
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              From &ldquo;I learned a skill&rdquo; to{" "}
              <span className="text-gradient">
                &ldquo;I can prove it, pitch it, and get hired.&rdquo;
              </span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              SkillProof turns your projects into portfolios, proposals, and
              client-interview readiness.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/onboarding">
                  Create My Portfolio
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <TryDemoButton size="lg" variant="outline" />
            </div>
            <p className="text-xs text-muted-foreground">
              No account needed to try. Your data stays in your browser.
            </p>
          </div>

          {/* Product mock */}
          <div className="animate-fade-in">
            <Card className="overflow-hidden border-border/70 shadow-lg">
              <CardHeader className="flex-row items-center gap-3 space-y-0 border-b border-border/60">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-teal-light">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-base">File Organizer Automation Script</CardTitle>
                  <CardDescription>Python Development · Case study</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground/90">Overview</p>
                <p>
                  A Python script that organizes files into folders by type and
                  date, built to remove a repetitive manual task.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Python", "Pandas", "OS"].map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="pt-1 font-medium text-foreground/90">
                  Why it matters to a client
                </p>
                <p>
                  Demonstrates practical automation that can be adapted to
                  everyday business workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="container scroll-mt-20 pb-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need to look hireable
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three outputs that turn a skill you learned into proof a client
            trusts.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="h-full">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-teal-light">
                  <benefit.icon className="h-6 w-6" />
                </span>
                <CardTitle className="pt-2">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="container pb-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Four steps from a skill you learned to proof a client trusts.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border/70 bg-card/50 p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal-light">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-24">
        <div className="rounded-2xl border border-border/70 bg-navy-800 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to prove your skill?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Build your portfolio in a few minutes. Bring a project — SkillProof
            handles the writing.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/onboarding">
              Create My Portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
