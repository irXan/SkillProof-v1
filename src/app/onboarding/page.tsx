"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Lightbulb,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SkillSelect } from "@/components/skill-select";
import { ProjectFormCard } from "@/components/project-form-card";
import { useSkillProof } from "@/components/providers/skillproof-provider";
import { onboardingSchema, type OnboardingInput } from "@/lib/validation";
import {
  createSampleDraft,
  MAX_PROJECTS,
  EMPTY_PROJECT,
} from "@/lib/constants";
import type { ProfileDraft, Skill } from "@/types";

function toDefaults(draft: ProfileDraft): OnboardingInput {
  const projects =
    draft.projects.length > 0
      ? draft.projects
      : [{ ...EMPTY_PROJECT, id: "project-1" }];

  return {
    fullName: draft.fullName ?? "",
    skill: draft.skill as Skill,
    githubUrl: draft.githubUrl ?? "",
    portfolioUrl: draft.portfolioUrl ?? "",
    projects: projects.map((project, index) => ({
      id: project.id || `project-${index + 1}`,
      title: project.title,
      tools: project.tools,
      description: project.description,
      problem: project.problem,
      result: project.result,
      link: project.link ?? "",
    })),
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const { hydrated, draft, setDraft } = useSkillProof();

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: toDefaults(draft),
    mode: "onBlur",
  });

  const { control, register, handleSubmit, reset, watch, formState } = form;
  const { errors, isSubmitting } = formState;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  // Re-hydrate the form once the provider has read localStorage.
  React.useEffect(() => {
    if (hydrated) {
      reset(toDefaults(draft));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const skill = watch("skill");

  const onSubmit = (values: OnboardingInput) => {
    const normalized: ProfileDraft = {
      fullName: values.fullName.trim(),
      skill: values.skill,
      githubUrl: values.githubUrl || undefined,
      portfolioUrl: values.portfolioUrl || undefined,
      projects: values.projects.map((project, index) => ({
        id: project.id || `project-${index + 1}`,
        title: project.title.trim(),
        tools: project.tools.trim(),
        description: project.description.trim(),
        problem: project.problem.trim(),
        result: project.result.trim(),
        link: project.link || undefined,
      })),
    };
    setDraft(normalized);
    toast.success("Profile saved. Generating your proof next.");
    router.push("/generate");
  };

  const handleInvalid = () => {
    toast.error("Please fix the highlighted fields before continuing.");
  };

  const loadSample = () => {
    reset(toDefaults(createSampleDraft()));
    toast.success("Sample project loaded.");
  };

  const addProject = () => {
    if (fields.length >= MAX_PROJECTS) {
      toast.error(`You can add up to ${MAX_PROJECTS} projects.`);
      return;
    }
    append({
      id: `project-${Date.now()}`,
      title: "",
      tools: "",
      description: "",
      problem: "",
      result: "",
      link: "",
    });
  };

  return (
    <div className="container py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-teal-light">Step 1 of 3</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Tell us what you&apos;ve built
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose your main skill and add one to three projects. SkillProof uses
          this to write everything else.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit(onSubmit, handleInvalid)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About you</CardTitle>
              <CardDescription>
                This shapes the tone of your bio and proposals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Ayesha Khan"
                  aria-invalid={Boolean(errors.fullName)}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-300">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill">Primary skill</Label>
                <Controller
                  control={control}
                  name="skill"
                  render={({ field }) => (
                    <SkillSelect
                      id="skill"
                      value={field.value}
                      invalid={Boolean(errors.skill)}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.skill && (
                  <p className="text-xs text-red-300">{errors.skill.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub (optional)</Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/you"
                    aria-invalid={Boolean(errors.githubUrl)}
                    {...register("githubUrl")}
                  />
                  {errors.githubUrl && (
                    <p className="text-xs text-red-300">
                      {errors.githubUrl.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio (optional)</Label>
                  <Input
                    id="portfolioUrl"
                    placeholder="https://your-site.com"
                    aria-invalid={Boolean(errors.portfolioUrl)}
                    {...register("portfolioUrl")}
                  />
                  {errors.portfolioUrl && (
                    <p className="text-xs text-red-300">
                      {errors.portfolioUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your projects</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadSample}
              >
                <Sparkles />
                Use Sample Project
              </Button>
            </div>

            {errors.projects && typeof errors.projects.message === "string" && (
              <Alert variant="destructive">
                <AlertDescription>{errors.projects.message}</AlertDescription>
              </Alert>
            )}

            {fields.map((field, index) => (
              <ProjectFormCard
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addProject}
              disabled={fields.length >= MAX_PROJECTS}
              className="w-full"
            >
              <Plus />
              Add another project ({fields.length}/{MAX_PROJECTS})
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              <Wand2 />
              Generate My Proof Kit
              <ArrowRight />
            </Button>
            <Button asChild variant="ghost">
              <Link href="/portfolio">Skip to preview</Link>
            </Button>
          </div>
        </form>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-teal-light" />
                Tips for strong input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Be specific about <span className="text-foreground">what you built</span> and
                the <span className="text-foreground">tools</span> you used — SkillProof only
                claims what your input supports.
              </p>
              <p>
                Don&apos;t worry about metrics. Describe purpose and value
                instead; we never invent numbers.
              </p>
              <p>
                Coursework and personal projects are perfect. That&apos;s the
                point.
              </p>
            </CardContent>
          </Card>

          <Alert variant="info">
            <AlertDescription>
              Selected skill: <span className="font-medium">{skill}</span>. You
              can change it any time before generating.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              Prefer to see it instantly? Click{" "}
              <span className="font-medium text-foreground">Use sample project</span> to
              load the demo data.
            </AlertDescription>
          </Alert>
        </aside>
      </div>
    </div>
  );
}
