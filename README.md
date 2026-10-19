# SkillProof

**From “I learned a skill” to “I can prove it, pitch it, and get hired.”**

SkillProof helps beginner freelancers turn their skills, coursework, personal
projects, and GitHub work into client-ready proof:

- **Portfolio case studies** — personal projects written up as credible, client-focused case studies
- **Professional bios** — a one-liner and a full bio
- **Upwork / Fiverr profile summary** — marketplace-ready copy
- **Tailored client proposals** — concise, personalized, outcome-focused
- **Client-interview practice** — five likely questions with strong, honest answers

It ships with a zero-setup **demo mode** (data stored in the browser) so you can
show the whole flow without an account or a database.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Core user flow](#core-user-flow)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Supabase setup](#supabase-setup)
- [Environment variables](#environment-variables)
- [How to run locally](#how-to-run-locally)
- [How to switch AI models](#how-to-switch-ai-models)
- [Demo mode](#demo-mode)
- [Error handling](#error-handling)
- [API reference](#api-reference)
- [Deploy to Vercel](#deploy-to-vercel)
- [Troubleshooting](#troubleshooting)
- [Verification checklist](#verification-checklist)

---

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 14 (App Router) + TypeScript                          |
| Styling    | Tailwind CSS + shadcn/ui-style primitives + Lucide icons      |
| AI         | Vercel AI SDK (`ai`) with an OpenAI-compatible provider       |
| Database   | Supabase Postgres (profiles, projects, generations)           |
| Auth       | Supabase email/password (optional — never blocks the demo)    |
| Validation | Zod                                                           |
| Forms      | React Hook Form + `@hookform/resolvers`                       |
| Deploy     | Vercel                                                        |

**Why these versions?** `next@14.2.35` is the patched 14.2 release. The AI SDK is
pinned to the stable v4 line (`ai@^4.3`) with `@ai-sdk/openai@^1.3`, which is the
combination that supports a custom `baseURL` and the OpenAI-compatible
`/chat/completions` endpoint used here. Zod is held at v3 (`^3.25`) because the
AI SDK v4 peer-depends on Zod 3; upgrading to Zod 4 would require AI SDK v5 and
broader changes, so v3 is the compatible, stable choice.

---

## Core user flow

1. **Landing (`/`)** — headline, subheadline, “Create My Portfolio” + “Try Demo” CTAs, three benefit cards, and a four-step “How it works”.
2. **Onboarding (`/onboarding`)** — pick one of eight skills, add 1–3 projects, or click **Use Sample Project** to prefill the demo data. All fields validated with Zod and show inline helper text.
3. **Generate (`/generate`)** — five AI outputs load progressively, each in its own card with a **Copy** button, a per-card **Generate/Regenerate**, and a **Was this useful?** rating. Choose an output length (**Concise / Balanced / Detailed**), optionally paste a client job post to tailor the proposal, and if AI isn’t configured the app renders **Demo Mode** sample output instead of failing.
4. **Portfolio preview (`/portfolio`)** — a responsive, public-looking portfolio built from the bio + case studies, with a **Copy portfolio link** button and a subtle “Generated with SkillProof” badge. Other assets (profile summary, proposal, interview Q&A) are shown below with copy buttons.

---

## Project structure

```
SkillProof-v1/
├─ src/
│  ├─ app/
│  │  ├─ api/generate/route.ts     # Server-side AI route (protects the API key)
│  │  ├─ generate/page.tsx         # AI generation page
│  │  ├─ login/page.tsx            # Email/password auth page
│  │  ├─ onboarding/page.tsx       # Skill + project input form
│  │  ├─ portfolio/page.tsx        # Portfolio preview + assets
│  │  ├─ globals.css               # Theme tokens (navy #0B1F3A / teal #12B5A5)
│  │  ├─ layout.tsx                # Root layout (header, footer, toaster, provider)
│  │  └─ page.tsx                  # Landing page
│  ├─ actions/
│  │  └─ save-portfolio.ts         # Optional: save draft + generations to Supabase
│  ├─ components/
│  │  ├─ ui/                       # shadcn/ui-style primitives
│  │  ├─ providers/
│  │  │  └─ skillproof-provider.tsx# In-memory + localStorage app state
│  │  ├─ auth-form.tsx
│  │  ├─ clear-draft-button.tsx    # Clear local draft + outputs
│  │  ├─ copy-button.tsx
│  │  ├─ generation-card.tsx
│  │  ├─ markdown.tsx              # Tiny, dependency-free Markdown renderer
│  │  ├─ portfolio-preview.tsx
│  │  ├─ project-form-card.tsx
│  │  ├─ site-header.tsx / site-footer.tsx
│  │  ├─ skill-select.tsx
│  │  └─ try-demo-button.tsx       # One-click sample + generate
│  ├─ lib/
│  │  ├─ ai/
│  │  │  ├─ generate.ts            # generateText / generateObject + retry/timeout
│  │  │  ├─ prompts.ts             # System prompt + per-output instructions
│  │  │  ├─ provider.ts            # OpenAI-compatible model factory
│  │  │  └─ schemas.ts             # Zod schema for structured interview output
│  │  ├─ supabase/
│  │  │  ├─ client.ts              # Browser client (null when unconfigured)
│  │  │  └─ server.ts              # Server + admin clients
│  │  ├─ constants.ts              # Sample project, generation metadata, quality
│  │  ├─ demo.ts                   # Demo Mode sample outputs
│  │  ├─ env.ts                    # Safe env access + config checks
│  │  ├─ feedback.ts               # Local helpful/not-helpful ratings
│  │  ├─ storage.ts                # localStorage helpers
│  │  ├─ utils.ts                  # cn(), email check
│  │  └─ validation.ts             # Zod schemas
│  ├─ middleware.ts                # Refreshes Supabase session; no-op without env
│  └─ types/index.ts               # Shared domain types
├─ supabase/migrations/
│  ├─ 0001_init.sql                # Tables: profiles, projects, generations
│  └─ 0002_rls.sql                 # Row Level Security policies
├─ .env.example
├─ components.json                 # shadcn/ui config
├─ tailwind.config.ts
└─ README.md
```

---

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- npm 9+
- A Supabase project (only needed for accounts/saving)
- An OpenAI-compatible API key (only needed for AI generation)

---

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
#    (copy the template, then fill in real values)
cp .env.example .env.local      # Windows: copy .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

> The app runs **without** any environment variables — AI generation will show a
> friendly “AI is not configured” banner and the demo flow still works. Add the
> variables below to enable real generation and saving.

---

## Supabase setup

You only need this for **accounts** and **saving portfolios**. Demo mode works
without it.

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor → New query** and run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`

   (Or, with the Supabase CLI: `supabase link` then `supabase db push`.)
3. Enable email/password auth: **Authentication → Providers → Email** → on.
   For the fastest demo, turn **Confirm email** off so sign-up logs you in
   immediately.
4. Copy your keys from **Project Settings → API** into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `anon` public key
   - `SUPABASE_SERVICE_ROLE_KEY` → `service_role` key (server-only; used by the optional save action)

### Schema

- **profiles**: `id`, `user_id` (nullable), `full_name`, `skill`, `bio`, `github_url`, `portfolio_url`, `created_at`
- **projects**: `id`, `profile_id`, `title`, `tools`, `description`, `problem`, `result`, `link`, `created_at`
- **generations**: `id`, `profile_id`, `type`, `content`, `created_at`

RLS is enabled on all three tables: owners can read/write their own rows, while
rows with a `null` `user_id` (anonymous demo) are read-only for everyone and
writable only by the service role.

---

## Environment variables

| Variable                        | Required for            | Notes                                                        |
| ------------------------------- | ----------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Accounts / saving       | Supabase Project URL                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts / saving       | Supabase anon key                                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Saving (server)         | Keep secret. Never expose to the client.                     |
| `AI_API_KEY`                    | AI generation           | Key for any OpenAI-compatible provider                       |
| `AI_BASE_URL`                   | AI generation           | Defaults to `https://api.openai.com/v1`                      |
| `AI_MODEL`                      | AI generation           | Defaults to `gpt-4o-mini`                                    |

Only variables prefixed with `NEXT_PUBLIC_` reach the browser. `AI_API_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` are used exclusively in server code
(`src/app/api/generate/route.ts` and `src/actions/save-portfolio.ts`).

---

## How to run locally

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint (next lint)
npm run typecheck  # tsc --noEmit
```

Try the flow without typing anything:

1. Go to **/onboarding** → click **Use sample project** → **Generate my proof**.
2. Watch the five cards fill in on **/generate**.
3. Open **/portfolio** to preview and copy the shareable link.

---

## How to switch AI models

SkillProof talks to any OpenAI-compatible **chat completions** endpoint. Change
the three `AI_*` variables and restart the server — no code changes required.

| Provider             | `AI_BASE_URL`                          | `AI_MODEL` example              |
| -------------------- | -------------------------------------- | ------------------------------- |
| OpenAI               | `https://api.openai.com/v1`            | `gpt-4o-mini`                   |
| Groq                 | `https://api.groq.com/openai/v1`       | `openai/gpt-oss-120b`           |
| OpenRouter           | `https://openrouter.ai/api/v1`         | `openai/gpt-4o-mini`            |
| Together             | `https://api.together.xyz/v1`          | `meta-llama/Llama-3.3-70B-Instruct-Turbo` |
| local (Ollama/vLLM)  | `http://localhost:11434/v1`            | `llama3.1`                      |

Notes:

- The provider factory lives in `src/lib/ai/provider.ts`. It calls
  `provider.chat(model)`, i.e. the `/chat/completions` route, for maximum
  compatibility. If you need a non-OpenAI-compatible API, add a new provider
  there.
- **Your provider account may not have every model enabled.** If a model 404s,
  list what's available, e.g.
  `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $AI_API_KEY"`,
  and set `AI_MODEL` to one of those ids. Groq `gpt-oss-*` models are reasoning
  models — the app already allows enough output tokens for them.
- Interview questions prefer **structured JSON** via `generateObject`. Providers
  without JSON-schema/tool support automatically fall back to text parsing, so
  generation still succeeds.
- Each call has a ~45s timeout and **one automatic retry** on transient errors.
- The active model is shown on the **/generate** page and returned by
  `GET /api/generate`.

---

## Demo mode

Demo mode means **the app is fully usable without any AI key or account**.

- If `AI_API_KEY` is missing, `/generate` shows a **“Demo Mode”** banner and
  produces realistic, honest sample outputs (clearly badged **Demo** on each
  card). Nothing is sent to any provider.
- If live generation **fails** (network, rate limit, bad key, malformed
  response), each card shows a friendly error with **Retry** and
  **Use demo output** buttons inside it. Project data is never lost.
- **Try Demo** on the landing page (and **Load sample & generate** in the empty
  state) loads the sample Python project and runs the whole flow in one click.
- Everything (draft, outputs, output-length preference) is stored in
  `localStorage` (`skillproof:state:v1`). Sign in with Supabase and click
  **Save to my account** on `/portfolio` to persist to Postgres.
- **Clear draft** in the header removes the local draft and outputs.

---

## Error handling

| Situation                        | Behavior                                                                 |
| -------------------------------- | ------------------------------------------------------------------------ |
| `AI_API_KEY` missing             | `/generate` shows a **Demo Mode** banner and produces labelled sample output. |
| AI provider error / outage       | One automatic retry; then the card shows a friendly error with **Retry** / **Use demo output**. |
| AI request hangs                 | Aborted after ~45s and surfaced as a retryable timeout error.            |
| AI response malformed/empty      | Interview output retries; an empty response triggers one retry, then a friendly error. |
| Invalid input                    | API returns `400 VALIDATION_ERROR` with field-level detail (Zod).        |
| Malformed request body           | API returns `400 BAD_JSON`.                                              |
| Direct API call with no key      | API returns `503 AI_NOT_CONFIGURED` (the UI never calls it in Demo Mode). |
| Supabase not configured          | Auth UI explains accounts are disabled; demo mode still works.           |
| Clipboard API unavailable        | Falls back to a hidden-textarea copy path.                               |

---

## API reference

### `GET /api/generate`

Returns whether AI is configured.

```json
{ "configured": true, "model": "gpt-4o-mini" }
```

### `POST /api/generate`

Body (validated with Zod):

```jsonc
{
  "type": "case_study | bio | profile_summary | proposal | interview_questions",
  "profile": { "fullName": "Ayesha Khan", "skill": "Python Development", "githubUrl": "https://..." },
  "projects": [
    {
      "id": "p1",
      "title": "File Organizer Automation Script",
      "tools": "Python, OS, Pandas",
      "description": "Organizes files into folders by type and date.",
      "problem": "Manual file organization is repetitive and time-consuming.",
      "result": "Demonstrates practical automation for business workflows.",
      "link": "https://github.com/example/file-organizer"
    }
  ],
  "clientContext": "optional client job post",
  "instructions": "optional steer for regenerate"
}
```

Response:

```json
{
  "content": "Markdown string",
  "questions": [{ "question": "...", "answer": "..." }],
  "model": "gpt-4o-mini"
}
```

`questions` is only present for `interview_questions`.

---

## Known limitations

- **No public hosting for portfolios.** “Copy portfolio link” shares the local
  `/portfolio` route only. Public shareable URLs are intentionally out of scope
  for the MVP.
- **No PDF export, payments, marketplace integrations, team accounts, or social
  login** — all intentionally excluded.
- **Outputs are stored in your browser** unless you sign in and save to
  Supabase. Clearing browser data (or **Clear draft**) removes them.
- **Saving creates a new profile row each time**; there is no upsert/versioning
  yet.
- **Feedback ratings** (“Was this useful?”) are stored locally only — the
  database schema has no ratings table.
- **AI output quality varies by model.** Reasoning models may be slower; the
  app shows per-card progress and a global “Generating x/5” indicator.
- **Portfolio preview “contact”** links to the freelancer’s GitHub/portfolio if
  provided; no email is collected, so there’s no direct contact button.

---

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repo. Framework auto-detects
   as Next.js; keep the default build settings.
3. Add the environment variables from [Environment variables](#environment-variables)
   in **Project → Settings → Environment Variables**.
4. Deploy. (The deployment runs with the same demo mode if you skip Supabase.)

---

## Troubleshooting

- **“AI is not configured”** — set `AI_API_KEY` (and usually `AI_BASE_URL` /
  `AI_MODEL`) in `.env.local` and restart `npm run dev`.
- **401 from the AI provider** — the key is wrong; re-check `AI_API_KEY`.
- **404 / model not found** — `AI_MODEL` doesn’t exist for that provider; check
  the provider’s model list.
- **429** — the provider is rate limiting; wait and retry.
- **Auth does nothing** — Supabase env vars are missing; accounts are disabled by
  design and demo mode still works.
- **Fonts** — the app uses a system font stack, so it builds and renders offline.

---

## Verification checklist

Run these to confirm everything works locally:

- [x] `npm install` completes.
- [x] `npm run typecheck` passes with no errors.
- [x] `npm run lint` passes with no warnings or errors.
- [x] `npm run build` completes and lists the routes `/`, `/onboarding`,
      `/generate`, `/portfolio`, `/login`, `/api/generate`.
- [x] `npm run dev` starts and serves all pages with `200`.
- [x] `GET /api/generate` returns `{ configured: false, model: null }` with no key.
- [x] `POST /api/generate` returns `503 AI_NOT_CONFIGURED` with no key.
- [x] **Demo Mode:** with no key, `/generate` shows the Demo banner and renders
      five badged sample outputs (one click via **Try Demo**).
- [x] With a configured provider, `POST /api/generate` returns Markdown content
      and, for `interview_questions`, a five-item `questions` array.
- [x] Output-length selector changes the generated copy (via prompt instructions).
- [x] Feedback buttons and **Clear draft** work; a refresh preserves the draft.
- [x] Demo flow: **/ → Try Demo → /generate → /portfolio** works end to end
      without an account or AI key.



PROMPT:
Project: SkillProof MVP — Next.js 14 App Router + TS, Tailwind, shadcn/ui, Supabase, Vercel AI SDK.
Repo: C:\Users\pc\Desktop\SkillProof-v1 — remote origin https://github.com/irXan/SkillProof-v1.git, branch main, in sync.
Pushed: 2dafc70 = Stage 0-2 portfolio layer (all green: typecheck/lint/build, 10 routes).
LOCAL-ONLY (untracked, do not re-create, just verify+push): 
  - src/app/(app)/dashboard/portfolio/[id]/edit/page.tsx  (portfolio editor: 2-col desktop edit|preview, mobile tabs, Basics/Links/Skills&Services/Projects/Appearance/Sections cards, publish via savePortfolioSite with guest editToken, valueRef guard so autosave doesn't clobber typing, dirty autosave ~900ms via provider.setPortfolio)
  - src/components/portfolio/editor/projects-editor.tsx  (project CRUD + move up/down + featured toggle + comma tools field via splitTools, max 6)
  Editor verification status: typecheck PASS, lint PASS, build NOT yet run -> run build first.
Shell: use D:\nodejs\npm.cmd (npm.ps1 blocked); -LiteralPath for paths with () or []; clear .next before typecheck after file moves.

CONTEXT: transforming SkillProof from text generator into editable live-portfolio platform. Guests publish WITHOUT login via portfolios.user_id=null + secret edit_token (writes through service role). Migration 0003 adds portfolios/portfolio_projects/portfolio_sections/generation_jobs (keep 0001/0002 unused). Missing Supabase tables => actions return friendly error, need user to apply 0003 in their Supabase project. AI (Groq) unconfigured => buildDemoPortfolio fallback; never fabricate metrics/clients/testimonials; dark theme tokens #0B1F3A/#122C4F/#12B5A5.

NEXT STEPS (in order):
1. Run build for the editor: `D:\nodejs\npm.cmd run build` (typecheck+lint already green). Fix anything that fails.
2. Quick manual QA via `npm run dev`: /generate -> "Create portfolio site" button (POST /api/portfolio/generate, Demo Mode fallback) -> lands on /dashboard/portfolio/draft/edit -> edit fields -> Publish (as guest: needs migration 0003 in user's Supabase; if user's cloud DB lacks tables, surface the friendly error) -> redirected to /dashboard/portfolio/<id>/edit -> "View live" opens /p/<slug>.
3. Commit Stage 2.2 (editor files above) and push to origin/main when user asks.
4. Stage 3: GitHub import — GET /api/github (fetch repos server-side, no key exposed), plus 3-5 context questions; feed import + answers into portfolio generation.
5. Stage 4: proposal + interview prep tiles generated from portfolio data (not old draft).
6. Stage 5: a11y, fonts, README polish + full QA; then push.
Only push when user explicitly asks. Follow AGENTS.md; do not disable working features; no payments/PDF/public Upwork integration.
