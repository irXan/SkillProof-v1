"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SKILLS, type Skill } from "@/types";

interface SkillSelectProps {
  value: Skill | undefined;
  onChange: (value: Skill) => void;
  id?: string;
  invalid?: boolean;
}

/** Skill picker backed by the eight supported SkillProof skills. */
export function SkillSelect({ value, onChange, id, invalid }: SkillSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Skill)}>
      <SelectTrigger id={id} aria-invalid={invalid}>
        <SelectValue placeholder="Choose your main skill" />
      </SelectTrigger>
      <SelectContent>
        {SKILLS.map((skill) => (
          <SelectItem key={skill} value={skill}>
            {skill}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
