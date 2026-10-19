import type { GenerationType, ProfileDraft, Project, Portfolio } from "@/types";
import { DEFAULT_SECTIONS, emptyProject, splitTools } from "@/lib/portfolio";

/**
 * Pre-written, honest sample outputs used in Demo Mode (and as the
 * "Use Demo Output" fallback when live generation fails). Everything here is
 * derived from the user's actual input — no invented clients, metrics, or
 * experience — so a demo never makes a false claim.
 */
export function buildDemoGeneration(
  type: GenerationType,
  draft: ProfileDraft,
): string {
  const name = draft.fullName?.trim() || "Your Name";
  const skill = draft.skill || "your skill";
  const projects =
    draft.projects.length > 0
      ? draft.projects
      : [
          {
            id: "demo",
            title: `A ${skill} project`,
            tools: skill,
            description: "A project you built to practise your skill.",
            problem: "A repetitive or manual task worth automating or improving.",
            result: "Demonstrates your ability to deliver a practical solution.",
          } as Project,
        ];

  switch (type) {
    case "case_study":
      return projects.map((project) => caseStudy(project, skill)).join("\n\n");
    case "bio":
      return bio(name, skill, projects);
    case "profile_summary":
      return profileSummary(name, skill, projects);
    case "proposal":
      return proposal(name, skill, projects);
    case "interview_questions":
      return interviewQuestions(skill, projects);
    default:
      return "Demo output.";
  }
}

function firstProject(projects: Project[]): Project {
  return projects[0];
}

function caseStudy(project: Project, skill: string): string {
  const tools = project.tools || skill;
  return [
    `### ${project.title}`,
    "",
    `**Overview**: ${project.description} It was built to support everyday workflows where reliable, repeatable results matter.`,
    "",
    `**The problem**: ${project.problem}`,
    "",
    `**What I built**: ${project.description} using ${tools}.`,
    "",
    `**How it works**: The approach breaks the task into clear steps, handles the common inputs it will meet, and keeps the output organised and easy to follow.`,
    "",
    `**Why it matters to a client**: It shows I can take a real need, choose sensible tools, and deliver a working, maintainable solution — the same process I would apply to your project.`,
  ].join("\n");
}

function bio(name: string, skill: string, projects: Project[]): string {
  const project = firstProject(projects);
  return [
    `### One-liner`,
    `${skill} specialist helping clients turn repetitive, manual work into clean, reliable results.`,
    "",
    `### Full bio`,
    `I'm ${name}, a ${skill} freelancer focused on practical, real-world work. My recent project — ${project.title} — ${lowerFirst(project.result)}`,
    "",
    `I care about clear communication and dependable delivery. Rather than promising things I can't show, I let the work speak: I describe what I built, the tools I used, and how it helps. If you need someone who learns quickly and takes ownership of the outcome, I'd be glad to help.`,
  ].join("\n");
}

function profileSummary(name: string, skill: string, projects: Project[]): string {
  const project = firstProject(projects);
  const tools = project.tools || skill;
  return [
    `**${skill} freelancer who turns your requirements into working, well-organised results.**`,
    "",
    `**What I can help you with**`,
    `- Building and polishing ${skill} deliverables from a clear brief`,
    `- Turning a manual, repetitive process into a faster, repeatable one`,
    `- Writing clean, documented work that's easy to maintain`,
    `- Communicating progress clearly and adjusting to your feedback`,
    "",
    `**Tools I use**: ${tools}`,
    "",
    `Here's a recent example of my work: **${project.title}** — ${lowerFirst(project.description)}`,
    "",
    `Have a project in mind? Send me a message with your goals and I'll reply with how I'd approach it.`,
  ].join("\n");
}

function proposal(name: string, skill: string, projects: Project[]): string {
  const project = firstProject(projects);
  return [
    `Hi [Client name],`,
    "",
    `I read your post about [specific requirement from their post] and it's exactly the kind of work I do as a ${skill} freelancer.`,
    "",
    `**Here's how I'd approach it**`,
    `- Start by confirming the goal and any constraints so we're aligned from day one`,
    `- Break the work into clear steps and share progress as I go`,
    `- Build it the same way I built ${project.title}: ${lowerFirst(project.description)}`,
    `- Test against your requirements, hand over clean work, and stay available for tweaks`,
    "",
    `I've delivered similar work before — for example, ${project.title}, which ${lowerFirst(project.result)}`,
    "",
    `Happy to start with a short call or a quick message to confirm scope. Would you like me to send a more detailed plan?`,
    "",
    `Best,\n${name}`,
  ].join("\n");
}

function interviewQuestions(skill: string, projects: Project[]): string {
  const project = firstProject(projects);
  const pairs: [string, string][] = [
    [
      `Can you walk me through ${project.title} and what you did?`,
      `I built ${project.title}. ${project.description} The main challenge was ${lowerFirst(project.problem)} and I addressed it with ${project.tools || skill}. It shows I can take a real need and deliver a working solution.`,
    ],
    [
      `How do you handle requirements that aren't fully clear at the start?`,
      `I ask a few focused questions to pin down the goal and constraints before I build, then confirm my understanding in writing. That way we agree on scope early and avoid surprises later.`,
    ],
    [
      `How do you make sure your work is reliable?`,
      `I test the common cases, keep the work organised and documented, and check it against the brief before handing it over. For ${project.title} I focused on making the solution easy to follow and maintain.`,
    ],
    [
      `How do you usually communicate progress?`,
      `I share updates at clear milestones and flag anything that needs a decision early. I'd rather over-communicate than leave you guessing, and I'm comfortable with quick async messages or scheduled calls.`,
    ],
    [
      `Why should I choose you over someone more experienced?`,
      `I may be early in my freelance career, but I'm honest, responsive, and I take ownership of the outcome. You can see exactly what I've built and how I work — and I'll make sure your project is done properly.`,
    ],
  ];
  return pairs
    .map(([q, a], index) => `### ${index + 1}. ${q}\n\n${a}`)
    .join("\n\n");
}

function lowerFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Builds an honest, structured demo portfolio from the user's own input.
 * Used when AI is unavailable, so the full portfolio → editor → publish flow
 * works with no API key configured.
 */
export function buildDemoPortfolio(
  draft: ProfileDraft,
): Omit<Portfolio, "id" | "slug" | "editToken" | "userId"> {
  const name = draft.fullName?.trim() || "Your Name";
  const skill = draft.skill || "your skill";
  const projects: Project[] =
    draft.projects.length > 0
      ? draft.projects
      : [
          {
            id: "demo",
            title: `A ${skill} project`,
            tools: skill,
            description: "A project you built to practise your skill.",
            problem: "A repetitive or manual task worth automating or improving.",
            result: "Demonstrates your ability to deliver a practical solution.",
          } as Project,
        ];

  const toolSet = new Set<string>();
  const portfolioProjects = projects.map((project, index) => {
    splitTools(project.tools || skill).forEach((tool) => toolSet.add(tool));
    return {
      ...emptyProject(index),
      title: project.title,
      clientType: "Small businesses",
      problem: project.problem,
      approach: `${project.description} Built with ${project.tools || skill}.`,
      outcome: project.result,
      tools: splitTools(project.tools || skill),
      githubUrl: project.link ?? "",
      isFeatured: index === 0,
    };
  });

  return {
    fullName: name,
    headline: `${skill} freelancer who turns requirements into reliable, working results.`,
    bio: `I'm ${name}, a ${skill} freelancer focused on practical, real-world work. My recent project, ${projects[0].title}, ${lowerFirst(projects[0].result)} I care about clear communication and dependable delivery, and I let the work speak: I describe what I built, the tools I used, and how it helps.`,
    location: "",
    email: "",
    githubUrl: draft.githubUrl ?? "",
    linkedinUrl: "",
    websiteUrl: draft.portfolioUrl ?? "",
    resumeUrl: "",
    skills: Array.from(toolSet).slice(0, 12),
    services: [
      {
        title: `${skill} deliverables`,
        description: "Building and polishing deliverables from a clear brief.",
      },
      {
        title: "Process automation",
        description: "Turning a manual, repetitive process into a faster, repeatable one.",
      },
      {
        title: "Clean, maintainable work",
        description: "Writing documented work that's easy to maintain and extend.",
      },
      {
        title: "Reliable communication",
        description: "Sharing progress clearly and adjusting to your feedback.",
      },
    ],
    contactCta: "Have a project in mind? Send me a message and I'll reply with how I'd approach it.",
    theme: "aurora",
    isPublished: false,
    projects: portfolioProjects,
    sections: DEFAULT_SECTIONS.map((section) => ({ ...section })),
  };
}
