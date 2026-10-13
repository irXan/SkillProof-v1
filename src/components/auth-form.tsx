"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { isValidEmail } from "@/lib/utils";

type Mode = "signin" | "signup";

/**
 * Email/password auth. Never blocks the demo — a "continue without an account"
 * path is always available, and when Supabase isn't configured we explain why
 * sign-in is disabled instead of failing.
 */
export function AuthForm() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const configured = isSupabaseConfigured();

  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Sign-in is unavailable because Supabase is not configured.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPending(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        toast.success("Account created. Check your email to confirm if required.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        toast.success("Signed in.");
      }
      router.push("/onboarding");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Save your portfolio and come back to it later.
        </p>
      </div>

      {!configured && (
        <Alert variant="info">
          <AlertDescription>
            Supabase isn&apos;t configured, so accounts are disabled. You can
            still use the full flow in demo mode.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={!configured || pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            disabled={!configured || pending}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={!configured || pending}>
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : mode === "signin" ? (
            <LogIn />
          ) : (
            <UserPlus />
          )}
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3 text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            setMode((prev) => (prev === "signin" ? "signup" : "signin"));
            setError(null);
          }}
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        <Button asChild variant="ghost" className="w-full">
          <Link href="/onboarding">Continue without an account (demo)</Link>
        </Button>
      </div>
    </div>
  );
}
