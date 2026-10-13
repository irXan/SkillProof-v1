"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingInput } from "@/lib/validation";

type ProjectField =
  | "id"
  | "title"
  | "tools"
  | "description"
  | "problem"
  | "result"
  | "link";

/** Builds a fully-typed react-hook-form path for a nested project field. */
function projectPath(
  index: number,
  field: ProjectField,
): `projects.${number}.${ProjectField}` {
  return `projects.${index}.${field}`;
}

interface ProjectFormCardProps {
  index: number;
  register: UseFormRegister<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
  onRemove?: () => void;
}

/** Field group for a single project inside the onboarding form. */
export function ProjectFormCard({
  index,
  register,
  errors,
  onRemove,
}: ProjectFormCardProps) {
  const projectErrors = errors.projects?.[index];
  const idPrefix = `projects.${index}`;

  return (
    <div className="rounded-xl border border-border/70 bg-navy-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Project {index + 1}</h3>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-red-300"
          >
            <Trash2 />
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Field
          id={`${idPrefix}.title`}
          label="Project title"
          hint="The name you'd show a client."
          error={projectErrors?.title?.message}
        >
          <Input
            id={`${idPrefix}.title`}
            placeholder="e.g. File Organizer Automation Script"
            aria-invalid={Boolean(projectErrors?.title)}
            {...register(projectPath(index, "title"))}
          />
        </Field>

        <Field
          id={`${idPrefix}.tools`}
          label="Tools / technologies used"
          hint="Comma-separated, e.g. Python, Pandas."
          error={projectErrors?.tools?.message}
        >
          <Input
            id={`${idPrefix}.tools`}
            placeholder="e.g. Python, OS, Pandas"
            aria-invalid={Boolean(projectErrors?.tools)}
            {...register(projectPath(index, "tools"))}
          />
        </Field>

        <Field
          id={`${idPrefix}.description`}
          label="What did you build?"
          hint="One or two sentences in plain language."
          error={projectErrors?.description?.message}
        >
          <Textarea
            id={`${idPrefix}.description`}
            placeholder="Describe the deliverable in plain language."
            aria-invalid={Boolean(projectErrors?.description)}
            {...register(projectPath(index, "description"))}
          />
        </Field>

        <Field
          id={`${idPrefix}.problem`}
          label="What problem does it solve?"
          hint="What was slow, manual, or missing before?"
          error={projectErrors?.problem?.message}
        >
          <Textarea
            id={`${idPrefix}.problem`}
            placeholder="What was painful, slow, or missing before?"
            aria-invalid={Boolean(projectErrors?.problem)}
            {...register(projectPath(index, "problem"))}
          />
        </Field>

        <Field
          id={`${idPrefix}.result`}
          label="Result or purpose"
          hint="What it achieves, or what it demonstrates. No metrics needed."
          error={projectErrors?.result?.message}
        >
          <Textarea
            id={`${idPrefix}.result`}
            placeholder="What does it achieve, or what does it demonstrate?"
            aria-invalid={Boolean(projectErrors?.result)}
            {...register(projectPath(index, "result"))}
          />
        </Field>

        <Field
          id={`${idPrefix}.link`}
          label="GitHub / portfolio link (optional)"
          hint="Optional — a repo or live demo a client can open."
          error={projectErrors?.link?.message}
        >
          <Input
            id={`${idPrefix}.link`}
            placeholder="https://github.com/you/project"
            aria-invalid={Boolean(projectErrors?.link)}
            {...register(projectPath(index, "link"))}
          />
        </Field>

        {/* Hidden id field so each project keeps a stable key when saved. */}
        <input type="hidden" {...register(projectPath(index, "id"))} />
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-red-300">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
