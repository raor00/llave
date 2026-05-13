# Desarrollo

## Prerequisitos

- Node.js 24 (lo que marque `engines`; pnpm + corepack manejan el resto)
- pnpm 11 (corepack auto-shim)
- macOS / Linux. Windows funciona vía WSL.

## Setup inicial

```bash
pnpm install
cp env.example .env.local
# editá .env.local con tus secretos (mínimo ANTHROPIC_API_KEY)
pnpm dev
```

La app levanta en `http://localhost:3000` (en los smoke tests usamos `:3007`).

Si tu shell no puede escribir `.env.local` (algunos entornos lo bloquean), usá los envs de Vercel y `vercel env pull .env.local`.

## Scripts

| Script | Qué hace |
|--------|----------|
| `pnpm dev` | Dev server de Next.js con Turbopack |
| `pnpm build` | Build de producción |
| `pnpm start` | Servir el build de producción |
| `pnpm lint` | ESLint (config de Next) |
| `pnpm test` | Vitest one-shot |
| `pnpm test:watch` | Vitest en watch mode |
| `pnpm test:ui` | UI de Vitest |
| `pnpm typecheck` | `tsc --noEmit --skipLibCheck` |

En CI o scripts, usá `node_modules/.bin/<tool>` directo — `pnpm <script>` activa el gate `verify-deps-before-run` que pelea con builds estrictos.

## Convenciones

- **TypeScript strict**. Nada de `any` salvo escape hatch de tipos de stream con un comentario.
- **Sin comentarios por default**. Solo cuando borrarlo sorprendería a un futuro lector.
- **Sin emojis en código ni commits**. La UI puede renderizar emojis si la copy ya los tenía.
- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`. Sin `Co-Authored-By`.
- **Un commit por work unit**: deps, schema, feature UI, tools, polish — cada uno separado.
- **Server first**. Marcá `"use client"` solo cuando necesite interactividad. Marketplace, detalle, dashboard, leads y landing corren como RSC.
- **Tailwind v4** con tokens de tema. Nunca escribas hex en clases — usá `var(--color-…)`.
- **No mockear la DB en tests**. El seed *es* el fixture; apoyate en él.
- **Trampa de permisos**: escribir a `.env*` está bloqueado en algunos entornos. Usá `vercel env add` y documentá fallbacks en `env.example`.

## Mapa de carpetas

Ver [architecture.md](./architecture.md) para el árbol canónico.

## Flow día a día

1. Elegí un cambio chico. Abrí la sección relevante de [`.claude/skills/llave/SKILL.md`](../.claude/skills/llave/SKILL.md) para las convenciones.
2. Si el cambio es no-trivial (feature nueva, schema), redactá un `docs/sdd/000N-<slug>/proposal.md` primero.
3. Escribí el código. Guardá observations en engram a medida (`mem_save` con topic_key `project/...`).
4. Antes de commitear: `pnpm typecheck && pnpm test`.
5. Commits por work unit.
6. Push cuando el usuario lo autorice.

## Debugear el chat

- `LLAVE_OFFLINE=1 pnpm dev` fuerza el mock determinista — útil para inspeccionar comportamiento de tools sin quemar tokens.
- `vercel logs --follow <deployment-url>` stremea logs reales de producción.
- `tests/local-mock-model.test.ts` cubre edge cases de intent. Agregá un caso ahí antes de debuguear el parser.

## Supabase local (opcional)

Si querés la DB real local:

1. Instalá el CLI de Supabase.
2. `supabase init && supabase start`.
3. `supabase db reset` corre las dos migraciones.
4. Agregá la URL local + anon key al `.env.local`.

Sin esto, corre el seed in-memory y el dev server no tiene dependencias de infra.
