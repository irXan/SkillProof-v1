import type { GenerationType } from "@/types";
import type { GenerateRequest } from "@/lib/validation";

/**
 * Master system prompt. Every generation shares the same voice and the same
 * hard "no fabrication" rules required by the product brief.
 */
export const SYSTEM_PROMPT = `You are SkillProof, an expert career-writing assistant that helps beginner freelancers in Pakistan present their real work in a professional, credible way.

Audience: international freelance clients on Upwork, Fiverr, and direct outreach.

Writing rules:
- Write in clear, professional English. Use short paragraphs and concrete detail.
- Turn beginner personal/coursework projects into credible, client-relevant case studies.
- NEVER invent facts. Do not fabricate metrics, percentages, revenue, client names, company names, testimonials, or timelines. If a number or outcome was not provided by the user, describe the value qualitatively instead.
- Only use the words "built", "implemented", "designed", and "demonstrates" when the user's input genuinely supports them. Never overstate scope or experience.
- Do not claim professional experience, certifications, or paid clients that were not provided.
- Prefer honesty and specificity over hype. No buzzword padding, no generic filler.
- Frame abilities in terms of client outcomes: what problem is solved, what the client gets.
- Keep formatting clean: use Markdown headings and bullet lists where helpful. Do not wrap the whole reply in a code fence.
- Return ONLY the requested content. No preamble like "Here is..." and no closing commentary.`;

/** Formats the user's profile + projects into a compact context block. */
function formatContext(input: GenerateRequest): string {
  const { profile, projects } = input;

  const projectBlocks = projects
    .map((project, index) => {
      const lines = [
        `Project ${index + 1}: ${project.title}`,
        `Tools/technologies: ${project.tools}`,
        `What was built: ${project.description}`,
        `Problem it solves: ${project.problem}`,
        `Result / purpose: ${project.result}`,
      ];
      if (project.link) lines.push(`Link: ${project.link}`);
      return lines.join("\n");
    })
    .join("\n\n");

  const links = [
    profile.githubUrl ? `GitHub: ${profile.githubUrl}` : null,
    profile.portfolioUrl ? `Portfolio: ${profile.portfolioUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    `Freelancer name: ${profile.fullName}`,
    `Primary skill: ${profile.skill}`,
    links ? `Links:\n${links}` : "",
    "",
    "Projects:",
    projectBlocks,
  ]
    .filter(Boolean)
    .join("\n");
}

const TYPE_INSTRUCTIONS: Record<GenerationType, string> = {
  case_study: `Write a portfolio case study for EACH project listed above.
For each project use this structure (use the project title as a level-3 "### " heading):
- **Overview**: 2-3 sentences on what the project is and who it helps.
- **The problem**: what pain the user's work addresses.
- **What I built**: the concrete deliverable and the tools used.
- **How it works**: a short, plain-English explanation of the approach.
- **Why it matters to a client**: the practical value a client could get from similar work.
Only reference tools and outcomes that appear in the input. 150-260 words per project.`,

  bio: `Write a professional bio for this freelancer in two versions:
1. A short "one-liner" (about 25 words) suitable for a profile headline.
2. A full bio of 90-140 words, written in first person, describing their focus skill, the kind of work they do, and the tools they use.
Base everything on the provided projects and skill. Do not invent years of experience or paid clients.`,

  profile_summary: `Write an Upwork/Fiverr profile summary ready to paste into a marketplace profile. It must include:
- A strong opening line (1-2 sentences) naming the skill and the client outcome.
- A "What I can help you with" bullet list of 4-6 concrete services grounded in the projects.
- A short "Tools I use" line.
- A friendly call to action inviting the client to message.
Keep it between 120-180 words. No fake metrics, no claims of clients you don't have.`,

  proposal: `Write a concise, personalized client proposal.
If the user provided a client job context below, tailor the proposal to that specific job; otherwise write a reusable proposal template with clearly marked placeholders like [Client name] and [Specific requirement from their post].
Structure:
- A personalized opening line that references the client's problem.
- A short "Here's how I'd approach it" section (3-5 bullets) mapping the freelancer's demonstrated abilities to the client's need.
- A 1-2 sentence credibility line referencing a relevant project.
- A closing line with a clear next step.
Keep it under 220 words. Focus on the client's outcomes, not on the freelancer's biography.`,

  interview_questions: `Generate exactly five questions an international client is likely to ask this freelancer in a screening call or chat, and a strong, honest suggested answer for each.
Requirements:
- Questions should be specific to the freelancer's skill and projects.
- Answers must be confident but honest; where the freelancer is a beginner, acknowledge it briefly and pivot to demonstrated ability and willingness to learn.
- Each answer should be 40-90 words and can reference the freelancer's actual projects.
Respond with ONLY valid JSON (no markdown fence, no commentary) in this exact shape:
{"questions":[{"question":"...","answer":"..."}]}`,
};

/**
 * Builds the user prompt for a given output type.
 * The `instructions` field lets the client steer a regenerate call.
 */
export function buildUserPrompt(input: GenerateRequest): string {
  const sections = [formatContext(input), "", `TASK:\n${TYPE_INSTRUCTIONS[input.type]}`];

  if (input.clientContext) {
    sections.push("", `CLIENT JOB / CONTEXT:\n${input.clientContext}`);
  }
  if (input.instructions) {
    sections.push("", `ADDITIONAL USER INSTRUCTIONS:\n${input.instructions}`);
  }

  return sections.join("\n");
}
