# Llave — Documentación

Bienvenido. Llave es un marketplace venezolano de alquileres construido alrededor de `Llavero`, un agente de IA que llama tools reales contra un marketplace persistido en Postgres. El producto salió al aire en el **Platanus Hackathon Build Night** de Anthropic (mayo 2026).

## Índice rápido

| Doc | Qué cubre |
|-----|-----------|
| [architecture.md](./architecture.md) | Sistema, ciclo de vida de la request, grafo de dependencias |
| [routes.md](./routes.md) | Todas las rutas públicas, qué renderizan y qué esperan |
| [agent-llavero.md](./agent-llavero.md) | System prompt, tools, intent flow, mock offline |
| [data-model.md](./data-model.md) | Schema Postgres, RLS, estrategia de seed |
| [branding.md](./branding.md) | Logo, paleta, tipografía, prompts de imagen |
| [logo-anatomy.md](./logo-anatomy.md) | Lectura oficial parte por parte del monograma |
| [brand-strategy.md](./brand-strategy.md) | Psicología de marca aplicada a Llave |
| [testing-flow.md](./testing-flow.md) | Smoke + flujo manual + guion de demo 90s |
| [3d-capture-workflow.md](./3d-capture-workflow.md) | Workflow de captura 3D (Gaussian Splat, USDZ, GLB) |
| [handoff-prompt.md](./handoff-prompt.md) | Prompt copiar/pegar para retomar Llave en otra sesión |
| [development.md](./development.md) | Setup local, scripts, convenciones |
| [testing.md](./testing.md) | Suite Vitest, alcance |
| [deployment.md](./deployment.md) | Deploy a Vercel, env vars, rollback |
| [security.md](./security.md) | RLS, secretos, rotación de claves, auditorías |
| [roadmap.md](./roadmap.md) | Lo que viene después del MVP |

## De un vistazo

- **Demo en vivo**: https://llave-ruby.vercel.app
- **Stack**: Next.js 16 App Router · React 19 · Vercel AI SDK v6 · Anthropic Claude Sonnet 4.5 (direct) · Supabase · Tailwind v4 · React Three Fiber · Maplibre
- **Estado del repo**: 7 commits en `main` (local, sin remoto todavía)
- **Tests**: `pnpm test` → 29 aserciones, 3 suites, en verde
- **Persistencia**: Postgres vía Supabase con fallback in-memory (17 inmuebles en 8 ciudades venezolanas)
