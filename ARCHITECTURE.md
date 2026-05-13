# Architecture

Documento canónico en [`docs/architecture.md`](./docs/architecture.md). Este archivo en raíz existe para que herramientas que esperan `ARCHITECTURE.md` en la raíz lo encuentren.

## Vista rápida

```
Browser (React 19)
  ├── /, /buscar, /inmueble/:id, /chat, /asesor, /login    (App Router)
  ├── POST /api/chat                                       (AI SDK streamText + tools)
  │     ├── @ai-sdk/anthropic (Claude Sonnet 4.5)          (default)
  │     ├── AI Gateway string routing                      (alterno)
  │     └── MockLanguageModelV3                            (offline fallback)
  └── Edge functions
        ├── /opengraph-image.tsx
        └── /icon.tsx

queries.ts ── Supabase ── Postgres con RLS
            └── seed-data.ts (in-memory si faltan envs)
```

## Módulos clave

| Carpeta | Responsabilidad |
|---------|-----------------|
| `src/app/` | Rutas, layouts y server components. Una página por feature. |
| `src/components/` | UI. Cliente solo cuando hay interactividad. |
| `src/lib/ai/` | Personalidad del agente, tools Zod, mock offline. |
| `src/lib/db/` | Capa de datos (Supabase + seed fallback). |
| `src/lib/supabase/` | Clientes SSR + middleware + detección de env. |
| `supabase/migrations/` | Schema SQL + RLS + seed. |
| `tests/` | Vitest suites — parser, schemas, queries. |
| `docs/` | Documentación de producto + ingeniería + branding. |

Detalle por componente: [`docs/architecture.md`](./docs/architecture.md).
