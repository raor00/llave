# Arquitectura

## Diagrama de alto nivel

```
Browser (React 19)
  │
  ├── /  /buscar  /inmueble/:id  /chat  /asesor  /login         (App Router)
  │       │
  │       └── React Server Components piden datos por src/lib/db/queries.ts
  │
  ├── POST /api/chat                                            (runtime Node, maxDuration 60)
  │       │
  │       ├── streamText({ model, tools })                      (AI SDK v6)
  │       │       ├── anthropic("claude-sonnet-4-5")            (directo, default)
  │       │       ├── "anthropic/claude-sonnet-4-5"             (AI Gateway, alterno)
  │       │       └── MockLanguageModelV3 (local-mock-model.ts) (fallback offline)
  │       └── tools/* → llaveroTools (7 tools Zod-tipadas) → queries.ts
  │
  └── Edge functions
          ├── /opengraph-image.tsx   (next/og)
          └── /icon.tsx              (next/og)

queries.ts
  ├── si hay env de Supabase → @supabase/ssr server client → Postgres
  └── si no                  → src/lib/db/seed-data.ts (in-memory)
```

## Ciclos de vida de las requests

### Marketplace `/buscar`

1. El server component recibe `searchParams` (city, type, price_max, rooms_min, q).
2. Llama a `searchProperties(filters)` desde `queries.ts`.
3. Si Supabase está configurado: query PostgREST con full-text en `search_tsv` + filtros; si no, filtro en memoria sobre el seed.
4. Devuelve HTML SSR con `ResultsView` (toggle lista/mapa + drawer comparador).
5. El cliente hidrata: `compare-store.ts` (useSyncExternalStore + localStorage), `property-map.tsx` (Maplibre, lazy-loaded).

### Chat `/chat`

1. Cliente `useChat({ transport: new DefaultChatTransport({ api: '/api/chat' }) })`.
2. El mensaje del usuario va como `UIMessage` por POST.
3. El server valida el payload, elige modelo según env, llama a `streamText` con `llaveroTools` y `stopWhen: stepCountIs(8)`.
4. El provider stremea deltas de texto + tool calls. El AI SDK ejecuta `execute()` de la tool (que pega a `queries.ts`), stremea `tool-input-available` y luego `tool-output-available`.
5. La UI renderiza cada `part` por `tool-result.tsx` (un layout distinto por nombre de tool).
6. Síntesis de voz opcional con `🔊 Voz ON`.

### Asesor `/asesor`

1. El SSR carga `stats`, `props`, `leads`, `owner` en paralelo.
2. Renderiza el dashboard. `Publicar con IA` abre el chat en `asesorMode` donde Llavero usa `createPropertyDraft` + `suggestPrice` (que escriben vía `queries.ts`).

## Límites de módulos

- `src/app/**` — solo rutas. Las páginas no importan SDKs de provider directamente.
- `src/lib/db/**` — única fuente de verdad para datos. Páginas y tools entran acá.
- `src/lib/ai/**` — persona del agente, schemas de tools, modelo mock.
- `src/lib/supabase/**` — clientes (server, browser, middleware) + detección de env.
- `src/components/**` — UI. Componentes cliente solo cuando hay interactividad.

## Por qué estas elecciones

- **AI SDK v6 + tool() + Zod** — tools type-safe, tool calls estructurados, sin pelear JSON a mano.
- **Supabase + fallback de seed** — la demo nunca rompe, incluso antes de tener infra arriba.
- **R3F en lugar de Spline** — sin runtime externo, la escena hero entra en 3 KB de código.
- **Maplibre + tiles de Carto** — sin API key, sin cuotas.
- **Web Speech API** — modo voz sin servicios externos.

## Lo que deliberadamente NO hicimos

- Sin librería de state (Zustand/Redux). Los server components + state local alcanzan.
- Sin librería de animación (Framer Motion). Las transiciones de CSS bastan.
- Sin tRPC / GraphQL. Server actions y `queries.ts` directo es más simple.
- Sin tests de UI (no compensa para el alcance del hackathon).
