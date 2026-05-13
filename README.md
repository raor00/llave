# Llave — Alquilar sin meses adelantados

Plataforma venezolana de alquileres con agente IA `Llavero` que rompe la fricción del modelo tradicional (meses adelantados + depósito + administrativo + comisión).

Construida en **Platanus Hackathon Build Night** (Anthropic, 2026).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Vercel AI SDK v6 + AI Gateway → `anthropic/claude-sonnet-4-6`
- Supabase (SSR auth + Postgres + Storage) — con fallback a seed JSON si faltan envs
- React Three Fiber + drei (hero 3D)
- Maplibre GL (mapa de inmuebles)
- Tailwind v4 (tema custom emerald + cream)
- Web Speech API (modo voz para Llavero)

## Características

- **Marketplace real** — 17 inmuebles VE, filtros por ciudad/tipo/precio/ambientes, vista lista o mapa, comparador (hasta 4 inmuebles).
- **Llavero (agente IA)** — 7 tools que tocan la DB de verdad: `searchProperties`, `getPropertyDetail`, `recommendByProfile`, `compareProperties`, `scheduleVisit`, `createPropertyDraft`, `suggestPrice`. Modo voz opcional (dictado + síntesis).
- **CRM asesor** — dashboard con stats, leads recibidos por el agente, publicar inmueble asistido por IA.
- **Landing 3D** — hero con casa procedural + llave flotante que rota con scroll.
- **Modelo Llave** — sin meses adelantados, depósito reducido reembolsable, garantía al propietario, reputación que vale.

## Setup local

```bash
pnpm install
cp env.example .env.local
# editá .env.local con tus credenciales
pnpm dev
```

### Variables de entorno

| Variable | Requerido | Cómo obtenerla |
|----------|-----------|----------------|
| `ANTHROPIC_API_KEY` | sí (preferido) | console.anthropic.com → API Keys |
| `AI_GATEWAY_API_KEY` | alt | vercel.com → AI Gateway → Create Token (requiere tarjeta) |
| `LLAVE_OFFLINE` | opcional | `1` fuerza el mock local (demo sin internet) |
| `NEXT_PUBLIC_SUPABASE_URL` | opcional | vercel.com → Marketplace → Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | opcional | mismo lugar |

Sin Supabase, la app funciona con seed JSON en memoria. Sin key de IA (y `LLAVE_OFFLINE=1` o cualquier valor por defecto), Llavero usa un parser local de intents que llama las tools reales — sirve para demo offline.

### Migraciones Supabase

Cuando tengas Supabase listo, corré en SQL Editor:

```bash
supabase/migrations/0001_init.sql
supabase/migrations/0002_seed.sql
```

## Tests

```bash
pnpm test          # one-shot Vitest
pnpm test:watch    # watch mode
pnpm typecheck     # tsc --noEmit
```

Cubrimos: extracción de entidades + intents del mock local, schemas Zod de las 7 tools de Llavero, y los filtros del marketplace contra el seed.

## Deploy

```bash
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel deploy --prod
```

## Estructura

```
src/
  app/
    page.tsx                 → Landing
    buscar/                  → Marketplace
    inmueble/[id]/           → Detalle
    chat/                    → Llavero (UI completa)
    asesor/                  → CRM demo
    api/chat/route.ts        → AI SDK streamText + tools
    opengraph-image.tsx      → OG dinámica
    icon.tsx                 → Favicon dinámico
  components/
    landing/hero-3d.tsx      → Casa procedural R3F
    chat/chat-window.tsx     → Chat con voz + tools inline
    chat/tool-result.tsx     → Render por tipo de tool
    marketplace/             → cards, filtros, mapa, comparador
  lib/
    ai/system-prompt.ts      → Personalidad Llavero
    ai/tools.ts              → Tools Zod-typed
    db/queries.ts            → Supabase + fallback seed
    db/seed-data.ts          → 17 inmuebles VE
supabase/migrations/         → Schema + seed SQL
```

## Roadmap visible (no en MVP)

- LiDAR 3D tours desde iPhone
- Contratos digitales generados con IA
- Integración Meta Ads + redes sociales
- Perfil crediticio emergente útil para banca
