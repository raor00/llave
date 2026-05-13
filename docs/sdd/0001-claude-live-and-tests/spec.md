# Spec — Llavero Live with Claude + Project Tests + Llave Skill

## Requirements

### R1 — Real Claude calls when key is present

The `/api/chat` route MUST call Claude via the AI SDK when an AI Gateway key or direct Anthropic key is configured.

**Acceptance**
- When `AI_GATEWAY_API_KEY` is set, `streamText` is invoked with model string `"anthropic/claude-sonnet-4-6"` (or env override `LLAVE_MODEL_ID`).
- When only `ANTHROPIC_API_KEY` is set, the route may still call the same model string (AI SDK Gateway accepts direct Anthropic too) **or** use `@ai-sdk/anthropic` if explicitly wired.
- When `LLAVE_OFFLINE=1`, the route uses `makeLocalMockModel` regardless of keys.
- When no key and no offline override, the route uses the mock (same as offline).
- Malformed bodies, missing `messages`, or `messages.length > 60` get explicit 4xx responses (no provider errors leaking).

### R2 — Llave project skill

A skill file MUST exist at `.claude/skills/llave/SKILL.md` (project-scoped) with valid frontmatter (`name`, `description`, `metadata.type`) and contain at minimum:
- The product manifesto and what's in/out of scope.
- The folder map of `src/` and `supabase/`.
- The seven Llavero tools and what their UI renders.
- Stack contract (Next 16 App Router, AI SDK v6, Supabase, Tailwind v4, R3F, Maplibre).
- Convention rules (no emojis in code, conventional commits, tsc via node_modules, .env writes blocked).
- Persisted memory protocol (engram topic_keys).

The skill MUST be listed when a Claude session boots in this repo.

### R3 — Vitest unit tests

`pnpm test` MUST execute Vitest in jsdom/happy-dom env and pass with ≥10 assertions across:

1. `src/lib/ai/local-mock-model.ts` — entity extraction (city, type, rooms, price ceilings, amenities, uuids) and intent routing (search vs recommend vs compare vs schedule vs publish vs price suggest).
2. `src/lib/ai/tools.ts` — Zod schemas of each tool accept realistic inputs and reject obvious invalids (e.g., comparing only 1 id, scheduling without contact).
3. `src/lib/db/queries.ts` — seed-backed `searchProperties` honours `city`, `price_max`, `rooms_min`, `amenities` and free-text `query` filters.

### R4 — Documentation hygiene

`README.md` MUST mention how to run tests and the `LLAVE_OFFLINE` flag. The `env.example` MUST list `LLAVE_OFFLINE`.

## Out of scope (this change)

- Authentication of the chat session (separate change).
- Persisting chat history to Supabase (separate change).
- Direct Anthropic provider as the primary route (keep gateway-first).
