# Proposal — Llavero Live with Claude + Project Tests + Llave Skill

## Why

The MVP is deployed but the agent runs in offline-mock mode unless an API key is present. To finish the hackathon submission we need:

1. **Llavero must call Claude for real** so the demo isn't bound to a hard-coded intent parser.
2. **A `llave` project skill** so any future Claude session (Claude Code, sub-agents, future contributors) automatically loads the full project context.
3. **An automated test floor** so regressions in the parsers, tools, and queries don't slip into the demo or future iterations.

## Scope (in)

- Route `streamText` through AI Gateway when `AI_GATEWAY_API_KEY` is set in production (already set in Vercel project).
- Accept either AI Gateway key or `ANTHROPIC_API_KEY` (direct) — the route already branches; finish the wiring for the direct case by depending on `@ai-sdk/anthropic`.
- Keep `LLAVE_OFFLINE=1` as a way to force the mock for offline demos.
- Add Vitest + `happy-dom` and ship a focused test suite that locks down:
  - intent + entity extraction in `local-mock-model.ts`
  - Zod schemas of the 7 Llavero tools
  - the seed-backed filtering in `queries.ts`
- Publish a project-scoped `llave` skill at `.claude/skills/llave/SKILL.md` (committed) so every Claude session loads the project contract.

## Scope (out)

- Replacing the AI Gateway routing with provider-specific code paths.
- E2E tests of the chat UI (Playwright). Roadmap only.
- Unit tests of UI components (low value for hackathon).
- Touching the LiDAR / contract / Meta Ads roadmap.

## Success criteria

- `POST /api/chat` returns a streaming response that includes at least one real tool call/result when an AI Gateway key is present in env.
- `pnpm test` (Vitest) passes locally with ≥10 assertions across the three target modules.
- A new Claude session opening this repo sees the Llave skill listed and uses it.
- `tsc --noEmit --skipLibCheck` stays clean.
- Production redeploy at `https://llave-ruby.vercel.app` keeps every route at 200 and `/api/chat` answers a real tool call.

## Risks

- AI Gateway returning 4xx (rate-limit, account verification). Mitigation: surface a friendly UI error already wired in `chat-window.tsx`; keep `LLAVE_OFFLINE=1` as a switch.
- Anthropic provider package adds bundle size. Mitigation: it's an `@ai-sdk/anthropic` peer used only on the server route — no impact on client bundle.
- Vitest with happy-dom may struggle with `crypto.randomUUID` in seed-data. Mitigation: pin to Node 24 in `engines` (already implicit) and avoid running tests that hit seed-data twice in the same suite (the module is singleton).
