import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Layout for the SkillProof app shell (landing, onboarding, generate, dashboard,
 * etc.). The public portfolio route `/p/[slug]` deliberately sits outside this
 * group so it renders as a standalone personal website.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
