# Tasks — Llavero Live with Claude + Project Tests + Llave Skill

- [x] T0 — Add `AI_GATEWAY_API_KEY` to Vercel production env (already done via CLI).
- [x] T1 — Trigger `vercel deploy --prod` so the new env reaches the running deployment.
- [ ] T2 — Install dev deps: `vitest`, `@vitest/ui`, `happy-dom`, `@testing-library/react`, `@testing-library/jest-dom`. Install runtime dep `@ai-sdk/anthropic` (kept ready, not invoked yet).
- [ ] T3 — Add `vitest.config.ts` with happy-dom env, `@` alias, `tests/**/*.test.ts` include.
- [ ] T4 — Add `"test": "vitest run"` and `"test:ui": "vitest --ui"` to `package.json`.
- [ ] T5 — Export `detectIntent` and `extractEntities` from `src/lib/ai/local-mock-model.ts` so the tests can reach them.
- [ ] T6 — Write `tests/local-mock-model.test.ts` covering: city, type, rooms, price_max extraction, amenity detection, uuid detection, intent for search / recommend / compare / schedule / publish / price-suggest.
- [ ] T7 — Write `tests/tools.test.ts` validating `searchProperties`, `compareProperties` (min 2), `scheduleVisit` (rejects missing contact at the execute level), `recommendByProfile`, `suggestPrice`, `createPropertyDraft` input schemas.
- [ ] T8 — Write `tests/queries.test.ts` exercising seed-backed `searchProperties` with city / price_max / rooms_min / amenities / free-text query.
- [ ] T9 — Write `.claude/skills/llave/SKILL.md` (project skill, see spec R2).
- [ ] T10 — Update `README.md` with a "Tests" section and reference the `LLAVE_OFFLINE` flag.
- [ ] T11 — Run `node_modules/.bin/tsc --noEmit --skipLibCheck` — must pass.
- [ ] T12 — Run `pnpm exec vitest run` — must pass (≥10 assertions).
- [ ] T13 — Smoke prod: every route 200, `/api/chat` returns a streaming response that includes a tool call.
- [ ] T14 — Conventional commit per work unit (deps, tests, skill, docs).
- [ ] T15 — Save to engram under `project/progress/sdd-0001-live-claude` and `project/skill/llave`.
