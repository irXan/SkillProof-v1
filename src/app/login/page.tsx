import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign in — SkillProof",
};

export default function LoginPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-14">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="rounded-2xl border border-border/70 bg-card/70 p-8">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
