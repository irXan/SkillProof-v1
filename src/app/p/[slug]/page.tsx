import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";
import { getPublishedPortfolio } from "@/lib/portfolio-data";

export const dynamic = "force-dynamic";

interface PublicPortfolioPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const portfolio = await getPublishedPortfolio(params.slug);

  if (!portfolio) {
    return { title: "Portfolio not published — SkillProof" };
  }

  const description = portfolio.bio?.slice(0, 160) || portfolio.headline || "";
  return {
    title: `${portfolio.fullName} — ${portfolio.headline || "Freelance Portfolio"}`,
    description,
    openGraph: {
      title: `${portfolio.fullName} — ${portfolio.headline || "Freelance Portfolio"}`,
      description,
      type: "profile",
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: PublicPortfolioPageProps) {
  const portfolio = await getPublishedPortfolio(params.slug);

  if (!portfolio) {
    return <NotPublished />;
  }

  return <PortfolioRenderer portfolio={portfolio} />;
}

function NotPublished() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-800 px-6 text-center text-white">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <BadgeCheck className="h-6 w-6" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        This portfolio is not published yet
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The link may be incorrect, or the owner has not published this portfolio
        publicly. Check the URL and try again.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-light hover:underline"
      >
        Create your own with SkillProof
      </Link>
    </div>
  );
}
