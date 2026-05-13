---
name: llave
description: Trigger when working on the Llave codebase — Venezuelan rental marketplace with `Llavero` AI agent. Use whenever editing `src/app/**`, `src/components/**`, `src/lib/**`, `supabase/migrations/**`, the chat API, the AI tools, the system prompt, the property schema, the asesor CRM, or the landing page. Provides the full project context, conventions, and architectural ground rules so any change stays coherent with the rest of the product.
metadata:
  type: project
  primary_paths:
    - src/app/
    - src/components/
    - src/lib/
    - supabase/migrations/
---

# Llave — Project Skill

## What Llave is

Llave is a Venezuelan rental marketplace that **eliminates the upfront-friction cost** of traditional rentals (advance month + deposit + admin fee + commission ≈ $1000+ before moving in). Tenants pay **one month to enter**, deposit is reduced (max 1 month) and fully refundable. Llave covers covered damages so the owner is protected.

The differentiator is **Llavero**, an AI agent built on Claude that:
- Talks to tenants conversationally, calls real DB tools (no hallucination), suggests honest matches.
- Helps asesores (real-estate agents) publish listings, suggest prices, and manage leads.
- Carries a clear manifesto in its system prompt — never asks for abusive requirements.

Built initially for **Platanus Hackathon Build Night** (Anthropic, May 2026). Built in Venezuela, designed to scale globally — branding and copy avoid hyper-local symbols except where it adds warmth (orchid bow, colonial archway teeth in the logo).

## Stack contract

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 App Router + Turbopack | RSC by default; only mark client where required |
| Language | TypeScript strict | `tsc --noEmit --skipLibCheck` must pass on every change |
| AI | Vercel AI SDK **v6** + AI Gateway → `anthropic/claude-sonnet-4-6` (fallback: direct via `@ai-sdk/anthropic` + `ANTHROPIC_API_KEY`) | Mock fallback `LLAVE_OFFLINE=1` for offline demos |
| DB | Supabase (Postgres + SSR auth + RLS) | In-memory seed fallback when env missing |
| Styling | Tailwind v4 + custom theme tokens in `globals.css` | Brand emerald `#128c5d`, warm gold `#f4c95d`, cream `#faf8f3`. Use `var(--color-brand-500)` etc. |
| Forms | react-hook-form + zod | Server input validation lives in tools too |
| 3D | React Three Fiber + drei | Lazy-load via `dynamic(..., { ssr: false })` |
| Maps | Maplibre GL + Carto Positron tiles (no API key) | Lazy-loaded the same way |
| Voice | Web Speech API (browser-native, no deps) | Feature-detected, never required |
| Deploy | Vercel (Fluid Compute, Node.js runtime) | Project: `raor00s-projects/llave`, alias `llave-ruby.vercel.app` |

**Never add a provider package just because it's familiar.** Default to AI Gateway via `'provider/model'` string.

## Folder map

```
src/
  app/
    page.tsx                  → landing
    buscar/page.tsx           → marketplace (server-rendered, searchParams driven)
    inmueble/[id]/page.tsx    → property detail
    chat/page.tsx             → Llavero chat
    asesor/                   → CRM demo (dashboard, leads, publicar)
    login/page.tsx            → Supabase magic-link auth
    api/chat/route.ts         → AI SDK streamText + tools (offline-aware)
    opengraph-image.tsx       → dynamic OG (edge)
    icon.tsx                  → dynamic favicon (edge)
    layout.tsx, globals.css   → root shell + theme tokens
  components/
    landing/                  → hero-3d.tsx, hero-3d-wrapper.tsx
    marketplace/              → property-card, filters, gallery, property-map,
                                 compare-store, compare-drawer, results-view
    chat/                     → chat-window, tool-result, use-voice
    site-header.tsx, site-footer.tsx, llave-logo.tsx
  lib/
    ai/
      system-prompt.ts        → Llavero persona + manifesto
      tools.ts                → 7 Zod-typed tools
      local-mock-model.ts     → offline / no-key fallback (MockLanguageModelV3)
    db/
      queries.ts              → Supabase + seed fallback
      seed-data.ts            → 17 properties + demo owner
    supabase/
      server.ts, client.ts, middleware.ts, env.ts
    format.ts, types.ts, utils.ts
  middleware.ts               → Supabase session refresh
supabase/migrations/
  0001_init.sql               → schema + RLS
  0002_seed.sql               → demo owner + 17 properties
```

## Llavero agent contract

**System prompt** lives in `src/lib/ai/system-prompt.ts`. Anyone editing it must keep:
- Spanish venezolano natural, warm but not slangy.
- Manifesto bullets (sin meses adelantados, comisión justa, garantía al propietario, reputación que vale).
- Hard rules: never invent properties, never request abusive requirements, always use tools for real data, do NOT dump full property details in text (the UI renders cards from tool output).

**Tools** in `src/lib/ai/tools.ts` — every tool MUST:
- Be Zod-typed (`inputSchema: z.object({...})`).
- Execute against `src/lib/db/queries.ts` (which transparently picks Supabase or seed).
- Return plain JSON that `src/components/chat/tool-result.tsx` knows how to render.
- Not perform writes outside of `scheduleVisit` and `createPropertyDraft`.

| Tool | Purpose | UI render |
|------|---------|-----------|
| `searchProperties` | Main inquilino search | grid of PropertyCard |
| `getPropertyDetail` | Single property deep view | card with CTA |
| `recommendByProfile` | Ranked recos by lifestyle/budget | reasons-list |
| `compareProperties` | Side-by-side, 2-4 ids | comparison grid with "cheapest"/"largest" chips |
| `scheduleVisit` | Creates lead (needs name + phone OR email) | success card → /asesor/leads |
| `createPropertyDraft` | Asesor-only publish flow | success card → /inmueble/[id] |
| `suggestPrice` | Comparables-based price range | range card + comp list |

When adding a new tool: add it to `llaveroTools`, add a render branch in `tool-result.tsx`, and update this skill's table above.

## Conventions

- **Caveman-style commit messages** when invoked manually, but every committed message uses **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). Never add Co-Authored-By.
- **No emojis in code or commits** unless they appear in user-facing UI copy that already used them.
- **Default no comments**; only add a comment when the *why* would surprise a future reader.
- **One commit per work unit** (UI vs schema vs tools vs polish); keep small.
- Use **`tsc --noEmit --skipLibCheck` via `node_modules/.bin/tsc`** to type-check — pnpm wrappers run install first and fight strict-builds.
- **Permissions traps**: writing to any `.env*` is blocked by this workspace's permission set. Use `vercel env add` and document in `env.example`.

## Data model summary

`profiles`, `properties`, `leads`, `messages`, `favorites` — see `supabase/migrations/0001_init.sql` for the full schema and RLS policies. Key invariants:

- `properties.status in ('disponible','reservado','alquilado','pausado')`; only `disponible` is publicly listable.
- `no_months_upfront` defaults `true` and is the visible Llave commitment.
- RLS allows asesores to INSERT only with `owner_id = auth.uid()`. Updates/deletes go through `properties_owner_write` (own only) or `properties_admin_all`.
- New users automatically get a profile via `on_auth_user_created` trigger.

When the agent or UI calls `queries.ts`, the function transparently uses Supabase if env is configured and falls back to `seed-data.ts` otherwise. Both code paths must stay consistent — when adding a new field to `Property`, update both `0001_init.sql`, `seed-data.ts` and `types.ts`.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `AI_GATEWAY_API_KEY` | preferred | Routes `'anthropic/claude-sonnet-4-6'` via Vercel AI Gateway |
| `ANTHROPIC_API_KEY` | alt | Direct Anthropic (needs `@ai-sdk/anthropic` if used as model object) |
| `LLAVE_OFFLINE` | optional | `1` forces the local mock model regardless of keys |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Switches DB from seed to Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Pair with the above |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Server-only admin operations (do NOT expose to client) |

Production today runs on AI Gateway + seed fallback. Supabase env can be added via `vercel env add` and a `vercel deploy --prod`.

## What is OUT of scope (roadmap, do NOT build here)

- LiDAR / 3D scan via iPhone (post-MVP)
- Generated PDF rental contracts (post-MVP)
- Meta Ads + social-network integration (post-MVP)
- Tenant credit profile useful for banks (post-MVP)
- Real rate-limiting on `scheduleVisit` (use Upstash Ratelimit when needed)
- Pagination on the asesor dashboard (only matters past ~1k rows)

If a request lands in this scope, push back: "this is on the roadmap, today we focus on X."

## Test strategy

- Unit tests with **Vitest** + `happy-dom`. Live in `tests/` next to the source they cover.
- Cover: entity extraction in the local-mock-model, queries.ts filtering, tools' Zod schemas accepting/rejecting realistic inputs.
- No tests for UI components yet (cost-benefit for hackathon scope). Add when behavior gets non-obvious.

## Persisted memory

Every meaningful decision, bugfix, schema or convention change MUST be saved to engram under `project: inmuebles` with a stable `topic_key` (e.g. `project/branding/logo`, `project/progress/<phase>`). Keep titles search-friendly and lead the body with **What / Why / Where / Learned**.
