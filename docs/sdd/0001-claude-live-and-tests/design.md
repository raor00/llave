# Design — Llavero Live with Claude + Project Tests + Llave Skill

## Approach summary

This change is mostly **wiring + new test scaffolding + a markdown skill**. No architecture is introduced or replaced.

## Component-level decisions

### `/api/chat` (`src/app/api/chat/route.ts`)

Already routes between the live model and the mock via a single `useOffline` flag computed from `LLAVE_OFFLINE` and the presence of API keys. The change here is:

- Add `@ai-sdk/anthropic` as a dependency to support direct routing if a future change ever needs to bypass the gateway. We do not invoke it in this change — AI Gateway string routing covers both keys.
- Keep `stopWhen: stepCountIs(useOffline ? 2 : 8)` — the live agent gets a higher step budget because it may chain tool calls.

### `local-mock-model.ts`

Already typed against `MockLanguageModelV3` with a deliberate `as never` cast on the stream object — V3's `LanguageModelV3StreamPart` is too strict to express by hand. Tests verify behavior (intent + entity extraction), not the internal stream shape, which makes the cast safe.

### Tests (`tests/` directory)

- `tests/local-mock-model.test.ts` — call exported `detectIntent` and `extractEntities`. To do this, those functions must be exported from `local-mock-model.ts`. Add `export` keyword to both functions; they have no behavior dependency on each other being internal.
- `tests/tools.test.ts` — import `llaveroTools` and assert `tool.inputSchema.parse(...)` succeeds / throws on chosen fixtures.
- `tests/queries.test.ts` — call `searchProperties({ city, ... })` and assert the result subset. Since `SUPABASE_ENABLED` is `false` in test env (no `NEXT_PUBLIC_SUPABASE_URL`), it falls through to seed.

Vitest config: `defineConfig({ test: { environment: 'happy-dom', globals: true, include: ['tests/**/*.test.ts'] } })`. Alias `@` to `./src` so test imports match runtime imports.

Add a `test` script to `package.json`: `"test": "vitest run"`.

### Llave skill (`.claude/skills/llave/SKILL.md`)

Markdown with YAML frontmatter (`name`, `description`, `metadata.type: project`). Description includes trigger phrases so the contextual loader picks it up automatically when files under `src/app`, `src/components`, `src/lib`, `supabase/migrations` are touched.

### Documentation

- Append a `## Tests` section to `README.md` showing `pnpm test`.
- Add `LLAVE_OFFLINE` to `env.example`.

## Open decisions

None. All choices follow the existing stack contract.

## Migration notes

No migrations.

## Verification plan

1. `node_modules/.bin/tsc --noEmit --skipLibCheck` — must pass.
2. `pnpm exec vitest run` — must pass (≥10 assertions).
3. `curl http://localhost:3007/api/chat` smoke (offline branch, no key in local) returns a streaming 200.
4. Production: `vercel deploy --prod`, then `curl https://llave-ruby.vercel.app/api/chat ...` with a real user message — observe a real tool call in the response.
5. Open this directory in a fresh Claude Code session — the `llave` skill MUST appear under available skills.
