import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SkillProofProvider } from "@/components/providers/skillproof-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SkillProof — Prove it, pitch it, get hired",
  description:
    "SkillProof turns your projects into portfolios, proposals, and client-interview readiness.",
  metadataBase: new URL("https://skillproof.vercel.app"),
  openGraph: {
    title: "SkillProof",
    description:
      "Turn your skills and projects into client-ready proof: portfolios, proposals, and interview practice.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1F3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground">
        <SkillProofProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </SkillProofProvider>
      </body>
    </html>
  );
}
